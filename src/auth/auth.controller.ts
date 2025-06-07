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
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { AtGuard, RtGuard } from './guards';

// Custom interface to include user payload from JWT
export interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ===== SIGN IN =====
  @Public()
  @Post('signin')
  async signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto);
  }

  // ===== SIGN OUT =====
  @UseGuards(AtGuard)
  @Post('signout/:id')
  async signOut(@Param('id', ParseIntPipe) id: number) {
    return this.authService.signOut(id);
  }

  // ===== REFRESH TOKENS =====
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(@Req() req: RequestWithUser) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const refreshToken = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return this.authService.refreshTokens(req.user.sub, refreshToken);
  }
}
