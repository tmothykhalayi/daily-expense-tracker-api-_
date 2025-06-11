import { Controller, Get, Post, Body, Param, UseGuards, Query, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService, ReportWithTotals } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { AtGuard } from '../auth/guards';
import { Role } from '../auth/enums/role.enum';

@Controller('reports')
@UseGuards(AtGuard)
@ApiBearerAuth()
@ApiTags('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  async createReport(
    @GetCurrentUserId() userId: number,
    @Body() createReportDto: CreateReportDto
  ) {
    return this.reportsService.createReport(userId, createReportDto);
  }

@Get('my/daily')
@ApiOperation({ summary: 'Get current user daily reports' })
async getMyDailyReport(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
  try {
    return await this.reportsService.getDailyReport(userId);
  } catch (error) {
    console.error('Error in getMyDailyReport:', error);
    throw new InternalServerErrorException('Failed to get daily report');
  }
}



  @Get('my/weekly')
  @ApiOperation({ summary: 'Get current user weekly reports' })
  async getMyWeeklyReports(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
    return this.reportsService.getWeeklyReport(userId);
  }

  @Get('my/monthly')
  @ApiOperation({ summary: 'Get current user monthly reports' })
  async getMyMonthlyReports(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
    return this.reportsService.getMonthlyReport(userId);
  }

  @Get('my/yearly')
  @ApiOperation({ summary: 'Get current user yearly reports' })
  async getMyYearlyReports(@GetCurrentUserId() userId: number): Promise<ReportWithTotals> {
    return this.reportsService.getYearlyReport(userId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all reports (Admin only)' })
  async getAllReports(
    @GetCurrentUser('role') role: Role,
    @GetCurrentUserId() userId: number
  ) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access all reports');
    }
    return this.reportsService.getAllReports();
  }
}
