
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import {ThrottlerGuard,ThrottlerModule,ThrottlerException,} from '@nestjs/throttler';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { SeedModule } from './seed/seed.module';
import { DatabaseModule } from './database/database.module';
import { LogsModule } from './logs/logs.module';
import { AuthModule } from './auth/auth.module';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { MailModule } from './mail/mail.module';

// Middleware
import { LoggerMiddle } from './logger.middle';

// Guards
import { AtGuard } from './auth/guards';
import { MailService } from './mail/mail.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UsersModule,
    CategoriesModule,
    ExpensesModule, 
    ReportsModule,
    DatabaseModule,
    SeedModule, 
    LogsModule,
    AuthModule,
    MailModule,
         


// Redis + Memory Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          ttl: 60000,
          stores: [
            new Keyv({
              store: new CacheableMemory({ 
                ttl: 30000, 
                lruSize: 5000})
            }),
            createKeyv(configService.getOrThrow<string>('REDIS_URL')),
          ],
        };
      },
    }),

    //rate limiting
    
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        throttlers: [{
          ttl: config.getOrThrow<number>('THROTTLE_TTL'),
          limit: config.getOrThrow<number>('THROTTLE_LIMIT'),
        }],
        ignoreUserAgents: [/^curl\//, /^PostmanRuntime\//]
      })
    }),
  ],
  controllers: [AppController],
  providers: [AppService, 
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor
    // },
    {
      provide: APP_GUARD,
      useClass: AtGuard
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    MailService
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddle)
      .forRoutes('users', 'categories', 'expenses', 'reports');
  }
}
