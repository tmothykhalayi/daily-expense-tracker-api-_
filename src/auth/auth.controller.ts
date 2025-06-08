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
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator';
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
  async signOut(
    @GetCurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    if (userId !== id) {
      throw new UnauthorizedException('Cannot sign out other users');
    }
    return this.authService.signOut(id);
  }

  // ===== REFRESH TOKENS =====
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @Req() req: RequestWithUser
  ) {
    const refreshToken = req.headers.authorization?.split(' ')[1] || '';
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
