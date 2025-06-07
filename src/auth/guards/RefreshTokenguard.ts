import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
- Purpose: Guard to protect routes that require a valid refresh token
- Uses the 'jwt-rt' Passport strategy to validate refresh tokens
*/
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-rt') {
  constructor() {
    super();
  }
}
