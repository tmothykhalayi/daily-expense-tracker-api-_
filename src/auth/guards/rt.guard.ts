import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
- Purpose: Guard to protect refresh token endpoints
- How it works: Uses the 'jwt-rt' Passport strategy to validate refresh tokens in requests
- Usage: Attach to refresh token routes to ensure only valid refresh tokens allow access
*/
@Injectable()
export class RtGuard extends AuthGuard('jwt-rt') {
  constructor() {
    super();
  }
}
