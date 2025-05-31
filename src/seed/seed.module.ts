import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Expense } from 'src/expenses/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Report, Expense])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
