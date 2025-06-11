import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DeepPartial } from 'typeorm';
import { Expense } from 'src/expenses/entities/expense.entity';

export enum ReportTimeRange {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface ReportWithTotals extends Report {
  totalAmount: number;
  averagePerDay: number;
  expenses: Expense[];
  categoryTotals: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}


@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async createReport(userId: number, createReportDto: CreateReportDto): Promise<Report> {
    const expenses = await this.expenseRepository.find({
      where: {
        userId,
        date: Between(new Date(createReportDto.start_date), new Date(createReportDto.end_date))
      },
      relations: ['category']
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const report = this.reportRepository.create({
      ...createReportDto,
      userId,
      total_amount: totalAmount
    });

    return this.reportRepository.save(report);
  }

  async getDailyReport(userId: number): Promise<ReportWithTotals> {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));

    return this.generateReport(userId, startDate, endDate, ReportTimeRange.DAILY);
  }

  async getWeeklyReport(userId: number): Promise<ReportWithTotals> {
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() - today.getDay()));
    const endDate = new Date(today.setDate(startDate.getDate() + 6));

    return this.generateReport(userId, startDate, endDate, ReportTimeRange.WEEKLY);
  }

  async getMonthlyReport(userId: number): Promise<ReportWithTotals> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.generateReport(userId, startDate, endDate, ReportTimeRange.MONTHLY);
  }

  async getYearlyReport(userId: number): Promise<ReportWithTotals> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    const endDate = new Date(today.getFullYear(), 11, 31);

    return this.generateReport(userId, startDate, endDate, ReportTimeRange.YEARLY);
  }

  async getAllReports(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['user', 'expenses', 'expenses.category'],
      order: { generated_at: 'DESC' }
    });
  }

  private async generateReport(
    userId: number,
    startDate: Date,
    endDate: Date,
    type: ReportTimeRange
  ): Promise<ReportWithTotals> {
    try {
      const expenses = await this.expenseRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate)
        },
        relations: ['category']
      });

      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averagePerDay = total / Math.max(days, 1);

      const categoryTotals = this.calculateCategoryTotals(expenses);

      const reportData: DeepPartial<Report> = {
        userId,
       
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_amount: total
      };

      const report = this.reportRepository.create(reportData);
      const savedReport = await this.reportRepository.save(report);

      return {
        ...savedReport,
        totalAmount: total,
        averagePerDay,
        expenses,
        categoryTotals,
        categoryBreakdown: categoryTotals
      } as ReportWithTotals;
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`);
      throw new Error('Failed to generate report');
    }
  }

  private calculateCategoryTotals(expenses: Expense[]): Record<string, number> {
    return expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);
  }
}
