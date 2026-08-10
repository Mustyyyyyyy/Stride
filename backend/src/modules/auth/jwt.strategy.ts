import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'stride_super_secret_jwt_access_key_2026',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // In demo / offline mode without active postgres, return payload user directly if DB is disconnected
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        return { id: payload.sub, email: payload.email };
      }
      return user;
    } catch {
      return { id: payload.sub, email: payload.email };
    }
  }
}
