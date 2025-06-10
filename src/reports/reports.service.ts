import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Report, ReportType } from './entities/report.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetReportDto, ReportTimeRange } from './dto/get-report.dto';
import { ReportWithTotals } from './interfaces/report-with-totals.interface';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    this.logger.log(`Creating new report: ${JSON.stringify(createReportDto)}`);
    const report = this.reportsRepository.create(createReportDto);
    return this.reportsRepository.save(report);
  }

  async getAllReports(getReportDto: GetReportDto): Promise<Report[]> {
    this.logger.log(`Getting all reports with filters: ${JSON.stringify(getReportDto)}`);
    const query = this.reportsRepository.createQueryBuilder('report');
    this.applyFilters(query, getReportDto);
    return query.getMany();
  }

  async getUserReports(userId: number, getReportDto: GetReportDto): Promise<ReportWithTotals[]> {
    this.logger.log(`Getting ${getReportDto.timeRange || 'all'} reports for user ${userId}`);

    const query = this.reportsRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.expenses', 'expense')
      .where('report.userId = :userId', { userId });

    this.applyFilters(query, getReportDto);

    const reports = await query.getMany();
    return this.calculateReportTotals(reports);
  }

  async getReportById(id: number): Promise<Report> {
    this.logger.log(`Getting report by ID: ${id}`);
    const report = await this.reportsRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    this.logger.log(`Updating report ${id}: ${JSON.stringify(updateReportDto)}`);
    const report = await this.getReportById(id);
    Object.assign(report, updateReportDto);
    return this.reportsRepository.save(report);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting report ${id}`);
    const result = await this.reportsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  async generateWeeklyReport(userId: number): Promise<ReportWithTotals> {
    this.logger.log(`Generating weekly report for user ${userId}`);
    const { startDate, endDate } = this.getDateRangeForTimeRange(ReportTimeRange.WEEKLY);

    // Normalize time boundaries
    this.normalizeStartEndDates(startDate, endDate);

    const expenses = await this.expensesRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      relations: ['category'],
    });

    const report = this.reportsRepository.create({
      userId,
      title: `Weekly Report ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      type: ReportType.WEEKLY,
      startDate,
      endDate,
    });

    await this.reportsRepository.save(report);

    return {
      ...report,
      expenses,
      ...this.calculateTotals(expenses, startDate, endDate),
    };
  }

  async generateMonthlyReport(userId: number): Promise<ReportWithTotals> {
    this.logger.log(`Generating monthly report for user ${userId}`);
    const { startDate, endDate } = this.getDateRangeForTimeRange(ReportTimeRange.MONTHLY);

    this.normalizeStartEndDates(startDate, endDate);

    const expenses = await this.expensesRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      relations: ['category'],
    });

    const report = this.reportsRepository.create({
      userId,
      title: `Monthly Report ${startDate.toLocaleDateString()}`,
      type: ReportType.MONTHLY,
      startDate,
      endDate,
    });

    await this.reportsRepository.save(report);

    return {
      ...report,
      expenses,
      ...this.calculateTotals(expenses, startDate, endDate),
    };
  }

  async generateYearlyReport(userId: number): Promise<ReportWithTotals> {
    this.logger.log(`Generating yearly report for user ${userId}`);
    const { startDate, endDate } = this.getDateRangeForTimeRange(ReportTimeRange.YEARLY);

    this.normalizeStartEndDates(startDate, endDate);

    const expenses = await this.expensesRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      relations: ['category'],
    });

    const report = this.reportsRepository.create({
      userId,
      title: `Yearly Report ${startDate.getFullYear()}`,
      type: ReportType.YEARLY,
      startDate,
      endDate,
    });

    await this.reportsRepository.save(report);

    return {
      ...report,
      expenses,
      ...this.calculateTotals(expenses, startDate, endDate),
    };
  }

  private calculateReportTotals(reports: Report[]): ReportWithTotals[] {
    return reports.map((report) => {
      const total = report.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

      const daysDiff = Math.max(
        1,
        Math.ceil((report.endDate.getTime() - report.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const averagePerDay = total / daysDiff;

      const categoryTotals: Record<string, number> = {};
      report.expenses?.forEach((expense) => {
        const category = expense.category || 'Uncategorized';
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
      });

      return {
        ...report,
        total,
        averagePerDay,
        categoryTotals,
      };
    });
  }

  private calculateTotals(expenses: Expense[], startDate: Date, endDate: Date) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averagePerDay = total / Math.max(1, days);

    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      const categoryName = expense.category || 'Uncategorized';
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
    });

    return { total, averagePerDay, categoryTotals };
  }

  private applyFilters(query: any, getReportDto: GetReportDto) {
    if (getReportDto.timeRange && getReportDto.timeRange !== ReportTimeRange.CUSTOM) {
      const { startDate, endDate } = this.getDateRangeForTimeRange(getReportDto.timeRange);
      const normalizedStart = new Date(startDate);
      const normalizedEnd = new Date(endDate);
      normalizedStart.setHours(0, 0, 0, 0);
      normalizedEnd.setHours(23, 59, 59, 999);

      query.andWhere('report.startDate >= :startDate AND report.endDate <= :endDate', {
        startDate: normalizedStart,
        endDate: normalizedEnd,
      });
    } else {
      const { startDate, endDate } = this.normalizeDateRange(getReportDto.startDate, getReportDto.endDate);

      if (startDate) {
        query.andWhere('report.startDate >= :startDate', { startDate });
      }
      if (endDate) {
        query.andWhere('report.endDate <= :endDate', { endDate });
      }
    }

    query.orderBy('report.createdAt', 'DESC');
  }

  private getDateRangeForTimeRange(timeRange: ReportTimeRange): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case ReportTimeRange.WEEKLY:
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case ReportTimeRange.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case ReportTimeRange.YEARLY:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  private normalizeDateRange(
    startDate?: Date | string,
    endDate?: Date | string,
  ): { startDate?: Date; endDate?: Date } {
    let normalizedStartDate = startDate ? new Date(startDate) : undefined;
    let normalizedEndDate = endDate ? new Date(endDate) : undefined;

    if (normalizedStartDate) {
      normalizedStartDate.setHours(0, 0, 0, 0);
    }
    if (normalizedEndDate) {
      normalizedEndDate.setHours(23, 59, 59, 999);
    }

    return { startDate: normalizedStartDate, endDate: normalizedEndDate };
  }

    private normalizeStartEndDates(startDate: Date, endDate: Date): void {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }
  }