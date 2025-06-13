import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { AtStrategy, RfStrategy } from './strategies/index'; 
import { ConfigService, ConfigModule } from '@nestjs/config';
import { RolesGuard } from './guards';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    UsersModule, // Add this import
    PassportModule.register({ defaultStrategy: 'jwt-at' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    AtStrategy,
    RfStrategy,
    ConfigService,
    RolesGuard, // Add RolesGuard to providers
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

