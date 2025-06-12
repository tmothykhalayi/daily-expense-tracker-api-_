import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from 'src/expenses/entities/expense.entity';
import { CreateExpenseDto } from 'src/expenses/dto/create-expense.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}


  async createExpense(userId: number, createExpenseDto: CreateExpenseDto) {
    // Create a new expense entity
    const newExpense = this.expenseRepository.create({
      ...createExpenseDto,
      user: { id: userId },  // assuming you have a user relation
    });

    // Save it to the database
    return await this.expenseRepository.save(newExpense);
  }

  async getDailyReport(userId: number, date: string) {
    const dateObj = new Date(date);
    return this.expenseRepository.find({
      where: { date: dateObj, user: { id: userId } },
      select: {},
      relations: ['user', 'category'],
    });
  }

  async getDailySummary(userId: number,date: string) {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.expense_id)', 'totalCount')
      .where('expense.date = :date', { date })
      .getRawOne();

    return {
      date,
      totalAmount: Number(result.totalAmount) || 0,
      totalCount: Number(result.totalCount) || 0,
    };
  }

  async getMonthlyReport(userId: number, year: number, month: number) {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.user', 'user')
      .leftJoinAndSelect('expense.category', 'category')
      .select([
        'expense',
        'user.user_id',
        'user.username',
        'user.email',
        'category'
      ])
      .where('EXTRACT(YEAR FROM expense.date) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM expense.date) = :month', { month })
      .andWhere('expense.userId = :userId', { userId })
      .getMany();
  }

  async getMonthlySummary(userId: number, year: number, month: number) {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.expense_id)', 'totalCount')
      .addSelect('AVG(expense.amount)', 'averageAmount')
      .where('EXTRACT(YEAR FROM expense.date) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM expense.date) = :month', { month })
      .andWhere('expense.user_id = :userId', { userId })
      .getRawOne();
  }
 
      async getYearlyReport(userId: number, year: number) {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.user', 'user')
      .leftJoinAndSelect('expense.category', 'category')
      .select([
        'expense',
        'user.user_id',
        'user.username',
        'user.email',
        'category'
      ])
      .where('EXTRACT(YEAR FROM expense.date) = :year AND user.user_id = :userId', { year, userId })
      .getMany();
  }
  async getYearlySummary(userId: number, year: number) {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.expense_id)', 'totalCount')
      .addSelect('AVG(expense.amount)', 'averageAmount')
      .where('EXTRACT(YEAR FROM expense.date) = :year', { year })
      .andWhere('expense.userId = :userId', { userId })
      .getRawOne();

    return {
      year,
      totalAmount: Number(result.totalAmount) || 0,
      totalCount: Number(result.totalCount) || 0,
      averageAmount: Number(result.averageAmount) || 0,
    };
  }
  async getCategoryReport(userId: number, categoryId: number) {
    const expenses = await this.expenseRepository.find({
      where: {
        userId,
        categoryId
      },
      relations: ['category', 'user']
    });

    if (!expenses.length) {
      throw new NotFoundException(`No expenses found for category ${categoryId}`);
    }

    return expenses;
  }
}
