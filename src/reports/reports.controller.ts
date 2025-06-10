import { Controller, Get, Post, Query, UseGuards, ForbiddenException, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Role } from '../auth/enums/role.enum';
import { GetReportDto, ReportTimeRange } from './dto/get-report.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportWithTotals } from './interfaces/report-with-totals.interface';

@Controller('reports')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @GetCurrentUserId() userId: number,
  ) {
    const reportData = { ...createReportDto, userId };
    return this.reportsService.createReport(reportData);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly report' })
  async getWeeklyReport(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
    return this.reportsService.generateWeeklyReport(userId);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  async getMonthlyReport(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
    return this.reportsService.generateMonthlyReport(userId);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly report' })
  async getYearlyReport(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
    return this.reportsService.generateYearlyReport(userId);
  }

  @Get('custom')
  @ApiOperation({ summary: 'Get custom date range report' })
  async getCustomReport(
    @GetCurrentUserId() userId: number,
    @Query() getReportDto: GetReportDto
  ): Promise<ReportWithTotals[]> {
    return this.reportsService.getUserReports(userId, getReportDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all reports (Admin only)' })
  async getAllReports(
    @GetCurrentUser('role') role: Role,
    @Query() getReportDto: GetReportDto
  ) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access all reports');
    }
    return this.reportsService.getAllReports(getReportDto);
  }
}
