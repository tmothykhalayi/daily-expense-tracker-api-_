import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/login.dto';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AtGuard, RtGuard } from './guards';

// Custom interface for typed user object on request
export interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Public login route
  @Public()
  @Post('signin')
  async signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto);
  }

  // Authenticated signout using access token
  @UseGuards(AtGuard)
  @Post('signout/:id')
  async signOut(@Param('id', ParseIntPipe) id: number) {
    return this.authService.signOut(id);
  }

  // Public route, protected by refresh token guard
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(@Req() req: RequestWithUser) {
    // Extract refresh token from Authorization header
    const refreshToken = req.headers['authorization']?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return this.authService.refreshTokens(req.user.sub, refreshToken);
  }
}
