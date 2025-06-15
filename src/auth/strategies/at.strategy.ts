import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    
    if (!jwtSecret) {
      throw new Error(
        'JWT_ACCESS_TOKEN_SECRET is not configured. Please check your environment variables.'
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
