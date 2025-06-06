import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { AtStrategy, RfStrategy } from './strategies'; 
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt-at' }), // Updated default strategy
  ],
  providers: [AuthService, AtStrategy, RfStrategy], // Added both strategies
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
