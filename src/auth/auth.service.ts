import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(createAuthDto: CreateAuthDto): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      // Select password explicitly (because in User entity password is select: false)
      const user = await this.userRepository.findOne({
        where: { email: createAuthDto.email },
        select: ['id', 'email', 'password', 'name', 'role'],
      });

      if (!user) {
        this.logger.warn(`Login attempt failed: User not found - ${createAuthDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare plain password with hashed password
      const isPasswordValid = await bcrypt.compare(createAuthDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login attempt failed: Invalid password - ${createAuthDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.getTokens(user.id, user.email);

      await this.updateRefreshToken(user.id, tokens.refreshToken);
      // Remove password from user object before returning
      const { password, ...result } = user;

      return {
        user: result,
        ...tokens,
      };
    } catch (error) {
      this.logger.error(`Sign in error: ${error.message}`);
      throw error;
    }
  }
  //ACCESS AND REFRESH TOKENS

  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '3h', //
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
   
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.update(userId, {
      hashedRefreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'hashedRefreshToken'],
    });


    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
  
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async signOut(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${userId}`);
    }

    // Clear the refresh token
    user.hashedRefreshToken = null;
    await this.userRepository.save(user);

    return { message: 'User signed out successfully' };
  }
}

