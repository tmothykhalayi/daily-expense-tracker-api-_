import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]), // <-- this registers Expense repository for DI
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
  exports: [ExpensesService], // if you want to export it for other modules
})
export class ExpensesModule {}
