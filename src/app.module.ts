import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { SeedModule } from './seed/seed.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddle } from './logger.middle';
import { DatabaseModule } from './database/database.module';
import { LogsModule } from './logs/logs.module';
import { AllExceptionsFilter } from './http-exception.filter';

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
    LogsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddle)
      .forRoutes('users', 'categories', 'expenses', 'reports')
  }
}