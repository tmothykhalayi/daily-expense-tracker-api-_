import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  email: string;
  [key: string]: any;
}

interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class RfStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,  // ensure expired tokens are rejected
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayloadWithRt> {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const refreshToken = authHeader.replace('Bearer ', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
