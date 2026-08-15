import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../../services/firebase.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialAuthDto } from './dtos/social-auth.dto';

@Injectable()
export class SocialAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  async socialLogin(dto: SocialAuthDto) {
    try {
      const decoded = await this.firebaseService.getAuth().verifyIdToken(dto.idToken);
      const provider = dto.provider || (decoded.firebase?.sign_in_provider === 'apple.com' ? 'apple' : 'google');
      const email = decoded.email;
      const fullName = decoded.name || email?.split('@')[0] || 'User';
      const firebaseUid = decoded.uid;

      if (!email) {
        throw new BadRequestException('Social account must have an email address.');
      }

      // Try to find existing user by email
      let user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Create new user from social account
        try {
          user = await this.prisma.user.create({
            data: {
              email: email.toLowerCase(),
              fullName,
              passwordHash: await this.hashPassword(firebaseUid + Date.now()),
              provider,
              firebaseUid,
            },
          });
        } catch (e: any) {
          if (e.code === 'P2002' || e.message?.includes('Unique constraint')) {
            throw new ConflictException('Email address is already registered.');
          }
          throw new BadRequestException(e.message || 'Social registration failed.');
        }
      } else {
        // Link Firebase UID if not already linked
        if (!user.firebaseUid) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { firebaseUid, provider },
          });
        }
      }

      const tokens = await this.generateTokens(user.id, user.email);
      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid social login token.');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 10);
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_SECRET || 'stride_super_secret_jwt_access_key_2026',
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'stride_super_secret_jwt_refresh_key_2026',
        expiresIn: '30d',
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, firebaseUid, ...sanitized } = user;
    return sanitized;
  }
}
