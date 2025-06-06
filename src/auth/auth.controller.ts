import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/login.dto';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AtGuard, RtGuard } from './guards';

export interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
    refreshToken: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  async signInLocal(@Body() createAuthDto: CreateAuthDto) {
    console.log('here')
    return this.authService.signIn(createAuthDto);
  }

  @UseGuards(AtGuard)
  @Post('signout/:id')
  async signOut(@Param('id', ParseIntPipe) id: number) {
    return this.authService.signOut(id);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}