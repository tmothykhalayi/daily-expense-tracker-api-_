import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

/*
- Purpose: Validates short-lived access tokens
- How it works: Extracts the JWT from the Authorization header, verifies it with the secret key, and attaches the payload to the request
*/

type JWTPayload = {
  sub: number;
  email: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ?? 'defaultAccessSecret',
    });
  }

  
  validate(payload: JWTPayload) {
    return payload;
  }
}
