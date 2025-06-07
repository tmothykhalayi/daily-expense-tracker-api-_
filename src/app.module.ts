import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { SeedModule } from './seed/seed.module';
import { DatabaseModule } from './database/database.module';
import { LogsModule } from './logs/logs.module';
import { LoggerMiddle } from './logger.middle';
import { CachingModule } from './caching/caching.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL') || 'redis://localhost:6379';
        return {
          ttl: 60, // seconds
          store: createKeyv(redisUrl),
        };
      }
    }),

    TypeOrmModule.forRoot({
      type: 'postgres', // or your DB type
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'B3YOND',
      database: 'expensetracker',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    UsersModule,
    CategoriesModule,
    ExpensesModule,
    ReportsModule,
    SeedModule,
    DatabaseModule,
    LogsModule,
    CachingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddle)
      .forRoutes('users', 'categories', 'expenses', 'reports');
  }
}

