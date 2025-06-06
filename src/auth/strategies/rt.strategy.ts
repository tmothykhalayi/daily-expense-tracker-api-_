import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

/*
- Purpose: Validates long-lived refresh tokens
- How it works: Extracts the refresh token from the Authorization header and validates it using the and attaches the payload to the request
and includes it in the returned payload, which can be used later in the application.
*/

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
      secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
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
// This strategy extracts the refresh token from the Authorization header, validates it, and attaches the payload to the request.
// The validate method also extracts the refresh token from the request and includes it in the returned payload, which can be used later in the application.