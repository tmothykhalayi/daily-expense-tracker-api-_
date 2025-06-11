import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
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

  async generateDailyReport(userId: number, year: number, month: number, day: number): Promise<ReportWithTotals> {
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(year, month - 1, day);
    this.normalizeStartEndDates(startDate, endDate);

    return this.generateReport(userId, startDate, endDate, ReportType.DAILY);
  }

  async generateWeeklyReport(userId: number, year: number, week: number): Promise<ReportWithTotals> {
    const startDate = this.getDateOfWeek(week, year);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    this.normalizeStartEndDates(startDate, endDate);

    return this.generateReport(userId, startDate, endDate, ReportType.WEEKLY);
  }

  async generateMonthlyReport(userId: number, year: number, month: number): Promise<ReportWithTotals> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    this.normalizeStartEndDates(startDate, endDate);

    return this.generateReport(userId, startDate, endDate, ReportType.MONTHLY);
  }

  async generateYearlyReport(userId: number, year: number): Promise<ReportWithTotals> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    this.normalizeStartEndDates(startDate, endDate);

    return this.generateReport(userId, startDate, endDate, ReportType.YEARLY);
  }

  async getAllReportsByYear(userId: number, year: number): Promise<Report[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    this.normalizeStartEndDates(startDate, endDate);

    return this.reportsRepository.find({
      where: {
        userId,
        startDate: Between(startDate, endDate)
      },
      relations: ['expenses', 'expenses.category'],
      order: { startDate: 'DESC' }
    });
  }

  private async generateReport(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    type: ReportType
  ): Promise<ReportWithTotals> {
    const expenses = await this.expensesRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      relations: ['category'],
    });

    const report = this.reportsRepository.create({
      userId,
      title: `${type} Report ${startDate.toLocaleDateString()}`,
      type,
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

  private getDateOfWeek(week: number, year: number): Date {
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + (week - 1) * 7);
    return date;
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
    const { startDate, endDate } = this.getDateRangeFromDto(getReportDto);
    
    query.andWhere('report.startDate >= :startDate AND report.endDate <= :endDate', {
      startDate,
      endDate,
    });

    query.orderBy('report.createdAt', 'DESC');
  }

  private getDateRangeFromDto(dto: GetReportDto): { startDate: Date; endDate: Date } {
    const now = new Date(dto.year, 0);
    let startDate: Date;
    let endDate: Date;

    switch (dto.timeRange) {
      case ReportTimeRange.DAILY:
        if (!dto.month || !dto.day) {
          throw new BadRequestException('Month and day are required for daily reports');
        }
        startDate = new Date(dto.year, dto.month - 1, dto.day);
        endDate = new Date(dto.year, dto.month - 1, dto.day);
        break;

      case ReportTimeRange.WEEKLY:
        if (!dto.week) {
          throw new BadRequestException('Week number is required for weekly reports');
        }
        startDate = this.getDateOfWeek(dto.week, dto.year);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;

      case ReportTimeRange.MONTHLY:
        if (!dto.month) {
          throw new BadRequestException('Month is required for monthly reports');
        }
        startDate = new Date(dto.year, dto.month - 1, 1);
        endDate = new Date(dto.year, dto.month, 0);
        break;

      case ReportTimeRange.YEARLY:
        startDate = new Date(dto.year, 0, 1);
        endDate = new Date(dto.year, 11, 31);
        break;

      default:
        throw new BadRequestException('Invalid report time range');
    }

    this.normalizeStartEndDates(startDate, endDate);
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