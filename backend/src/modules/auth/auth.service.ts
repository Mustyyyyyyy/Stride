import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshToken } from '@prisma/client';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          fullName: dto.fullName,
          weight: dto.weight || 70,
          height: dto.height || 175,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);
      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (e: any) {
      if (e.code === 'P2002' || e.message?.includes('Unique constraint')) {
        throw new ConflictException('Email address is already registered.');
      }
      throw new BadRequestException(e.message || 'Registration failed.');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (user) {
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid email or password credentials.');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        return {
          user: this.sanitizeUser(user),
          ...tokens,
        };
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      console.error('Login error:', err);
    }

    throw new UnauthorizedException('Invalid email or password credentials.');
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'stride_super_secret_jwt_refresh_key_2026',
      });

      // Validate the refresh token exists in the database and is not revoked
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: dto.refreshToken,
          userId: payload.sub,
          revoked: false,
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token is invalid or has been revoked.');
      }

      // Optionally revoke the old refresh token for security (rotation)
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      const tokens = await this.generateTokens(payload.sub, payload.email);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }
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

    // Persist the refresh token in the database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins in seconds
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
