import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(createAuthDto: CreateAuthDto) {
    // Find user with password included
    const user = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: ['id', 'email', 'password', 'role', 'name'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
console.log(createAuthDto.password);
    // Verify password
    const isPasswordValid = await bcrypt.compare(
      createAuthDto.password,
      user.password, // Use the password from the user entity
      // user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email);
    
    // Save refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Return response without sensitive data
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens
    };
  }

  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
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

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken
    );

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
    user.hashedRefreshToken = 'null';
    await this.userRepository.save(user);

    return { message: 'User signed out successfully' };
  }
}
