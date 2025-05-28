import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [UsersModule, CategoriesModule, ExpensesModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
