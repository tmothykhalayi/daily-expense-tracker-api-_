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

      this.logger.log('[AuthService] Tokens generated successfully');

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
  async refreshTokens(userId: number, refreshToken: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'hashedRefreshToken'],
      });

      if (!user) {
        this.logger.warn(`Refresh failed: User not found - ID: ${userId}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.hashedRefreshToken) {
        this.logger.warn(`Refresh failed: No refresh token stored - ID: ${userId}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
      );

      if (!tokenMatches) {
        this.logger.warn(`Refresh failed: Token mismatch - ID: ${userId}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      throw error;
    }
  }

  // ===== VALIDATE TOKEN =====
  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ===== SIGN OUT =====
  async signOut(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(`Signout failed: User not found - ID: ${userId}`);
        throw new NotFoundException(`User not found: ${userId}`);
      }

      await this.userRepository.update(userId, {
        hashedRefreshToken: null,
      });

      return { message: 'Successfully signed out' };
    } catch (error) {
      this.logger.error(`Sign out error: ${error.message}`);
      throw error;
    }
  }

  // ===== GET TOKENS =====
  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
 // ===== UPDATE REFRESH TOKEN =====
private async updateRefreshToken(userId: number, refreshToken: string) {
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  this.logger.log(`Hashing and updating refresh token for user ID: ${userId}`);

  const result = await this.userRepository.update(userId, { hashedRefreshToken });
  this.logger.log(`Update result: ${JSON.stringify(result)}`);

  if (result.affected === 0) {
    this.logger.warn(`Failed to update refresh token hash for user ID: ${userId}`);
  } else {
    this.logger.log(`Refresh token hash updated successfully for user ID: ${userId}`);
  }
}
}