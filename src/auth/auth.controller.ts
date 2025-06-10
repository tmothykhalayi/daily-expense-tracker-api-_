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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

// Custom interface to include user payload from JWT
export interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
  };
}

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ===== SIGN IN =====
  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Sign in user' })
  @ApiBody({
    type: CreateAuthDto,
    examples: {
      user1: {
        value: {
          email: 'user@example.com',
          password: 'StrongP@ss123',
        },
        summary: 'Basic user credentials',
      },
      user2: {
        value: {
          email: 'admin@example.com',
          password: 'AdminP@ss123',
        },
        summary: 'Admin credentials',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          role: 'USER',
        },
        accessToken: 'eyJhbGciOiJIUzI1...',
        refreshToken: 'eyJhbGciOiJIUzI1...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto);
  }

  // ===== SIGN OUT =====
  @UseGuards(AtGuard)
  @Post('signout/:id')
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed out',
    schema: {
      example: {
        message: 'Successfully signed out',
      },
    },
  })
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
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1...',
        refreshToken: 'eyJhbGciOiJIUzI1...',
      },
    },
  })
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @Req() req: RequestWithUser
  ) {
    const refreshToken = req.headers.authorization?.split(' ')[1] || '';
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
