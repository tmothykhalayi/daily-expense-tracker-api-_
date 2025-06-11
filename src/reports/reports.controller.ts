import { Controller, Get, Post, Query, UseGuards, ForbiddenException, Body, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Role } from '../auth/enums/role.enum';
import { GetReportDto, ReportTimeRange } from './dto/get-report.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportWithTotals } from './interfaces/report-with-totals.interface';
import { Logger } from '@nestjs/common';

@Controller('reports')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @GetCurrentUserId() userId: number,
  ) {
    const reportData = { ...createReportDto, userId };
    return this.reportsService.createReport(reportData);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily report' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'day', required: true })
  async getDailyReport(
    @GetCurrentUserId() userId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number
  ): Promise<ReportWithTotals> {
    return this.reportsService.generateDailyReport(userId, year, month, day);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly report' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'week', required: true })
  async getWeeklyReport(
    @GetCurrentUserId() userId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('week', ParseIntPipe) week: number
  ): Promise<ReportWithTotals> {
    return this.reportsService.generateWeeklyReport(userId, year, week);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  async getMonthlyReport(
    @GetCurrentUserId() userId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number
  ): Promise<ReportWithTotals> {
    return this.reportsService.generateMonthlyReport(userId, year, month);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly report' })
  @ApiQuery({ name: 'year', required: true })
  async getYearlyReport(
    @GetCurrentUserId() userId: number,
    @Query('year', ParseIntPipe) year: number
  ): Promise<ReportWithTotals> {
    return this.reportsService.generateYearlyReport(userId, year);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all reports by year' })
  @ApiQuery({ name: 'year', required: true })
  async getAllReports(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role,
    @Query('year', ParseIntPipe) year: number
  ) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access all reports');
    }
    return this.reportsService.getAllReportsByYear(userId, year);
  }
}
