import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { CreateAuthDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ===== SIGN IN =====
  async signIn(
    createAuthDto: CreateAuthDto,
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: createAuthDto.email },
        select: ['id', 'email', 'password', 'name', 'role', 'hashedRefreshToken'],
      });

      if (!user) {
        this.logger.warn(`Login attempt failed: User not found - ${createAuthDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        createAuthDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Login attempt failed: Invalid password - ${createAuthDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const { accessToken, refreshToken } = await this.getTokens(
        user.id,
        user.email,
      );

      await this.updateRefreshToken(user.id, refreshToken);

      // Create a copy without sensitive fields
      const { password, hashedRefreshToken, ...userWithoutSensitive } = user;

      return {
        user: userWithoutSensitive,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(`Sign in error: ${error.message}`);
      throw error;
    }
  }

  // ===== REFRESH TOKENS =====
  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'hashedRefreshToken'],
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.getTokens(user.id, user.email);

    await this.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ===== SIGN OUT =====
  async signOut(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User not found with id: ${userId}`);
    }

    user.hashedRefreshToken = null;
    await this.userRepository.save(user);

    return { message: 'User signed out successfully' };
  }

  // ===== GET TOKENS =====
  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: '5m', // Access token valid for 5 minutes
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: '1h', // Refresh token valid for 1 hour (adjust as needed)
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ===== UPDATE REFRESH TOKEN =====
  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.update(userId, {
      hashedRefreshToken,
    });
  }
}
