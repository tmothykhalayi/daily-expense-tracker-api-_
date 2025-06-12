import { 
  Controller, 
  Get, 
  Param, 
  ParseIntPipe, 
  UseGuards,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetCurrentUserId } from '../auth/decorators/get-current-user-id.decorator';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetReportDto } from './dto/get-report.dto';

@Controller('reports')
@ApiBearerAuth()
@ApiTags('reports')
@UseGuards(AtGuard, RolesGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly/:year/:month')
  @ApiOperation({ summary: 'Get monthly report' })
  @ApiResponse({
    status: 200,
    description: 'Monthly report retrieved successfully',
    type: GetReportDto 
  })
  async getMonthlyReport(
    @GetCurrentUserId() userId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    try {
      return await this.reportsService.getMonthlyReport(userId, year, month);
    } catch (error) {
      this.logger.error(`Error getting monthly report: ${error.message}`);
      throw new InternalServerErrorException('Failed to get monthly report');
    }
  }

  @Get('monthly-summary/:year/:month')
  @ApiOperation({ summary: 'Get monthly summary' })
  async getMonthlySummary(
    @GetCurrentUserId() userId: number,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    try {
      return await this.reportsService.getMonthlySummary(userId, year, month);
    } catch (error) {
      this.logger.error(`Error getting monthly summary: ${error.message}`);
      throw new InternalServerErrorException('Failed to get monthly summary');
    }
  }

  @Get('yearly/:year')
  @ApiOperation({ summary: 'Get yearly report' })
  async getYearlyReport(
    @GetCurrentUserId() userId: number,
    @Param('year', ParseIntPipe) year: number
  ) {
    try {
      return await this.reportsService.getYearlyReport(userId, year);
    } catch (error) {
      this.logger.error(`Error getting yearly report: ${error.message}`);
      throw new InternalServerErrorException('Failed to get yearly report');
    }
  }

  @Get('yearly-summary/:year')
  @ApiOperation({ summary: 'Get yearly summary' })
  async getYearlySummary(
    @GetCurrentUserId() userId: number,
    @Param('year', ParseIntPipe) year: number
  ) {
    try {
      return await this.reportsService.getYearlySummary(userId, year);
    } catch (error) {
      this.logger.error(`Error getting yearly summary: ${error.message}`);
      throw new InternalServerErrorException('Failed to get yearly summary');
    }
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Get daily report' })
  async getDailyReport(
    @GetCurrentUserId() userId: number,
    @Param('date') date: string
  ) {
    try {
      return await this.reportsService.getDailyReport(userId, date);
    } catch (error) {
      this.logger.error(`Error getting daily report: ${error.message}`);
      throw new InternalServerErrorException('Failed to get daily report');
    }
  }

  @Get('daily-summary/:date')
  @ApiOperation({ summary: 'Get daily summary' })
  async getDailySummary(
    @GetCurrentUserId() userId: number,
    @Param('date') date: string
  ) {
    try {
      return await this.reportsService.getDailySummary(userId, date);
    } catch (error) {
      this.logger.error(`Error getting daily summary: ${error.message}`);
      throw new InternalServerErrorException('Failed to get daily summary');
    }
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get category report' })
  async getCategoryReport(
    @GetCurrentUserId() userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number
  ) {
    try {
      return await this.reportsService.getCategoryReport(userId, categoryId);
    } catch (error) {
      this.logger.error(`Error getting category report: ${error.message}`);
      throw new InternalServerErrorException('Failed to get category report');
    }
  }

  
}
