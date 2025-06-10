import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetReportDto } from './dto/get-report.dto';
import { Report } from './entities/report.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AtGuard, RolesGuard } from '../auth/guards';
import { GetCurrentUserId, GetCurrentUser, Roles } from '../auth/decorators';
import { Role } from '../auth/enums/role.enum';

@Controller('reports')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Create a new report
  @Post()
  @ApiOperation({ summary: 'Create new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async createReport(
    @GetCurrentUserId() userId: number,
    @Body() createReportDto: CreateReportDto
  ): Promise<Report> {
    console.log(`[ReportsController] Creating report for user ${userId}`);
    return this.reportsService.createReport({ ...createReportDto, userId });
  }
  
  // Get all reports
  @Get()
  @ApiOperation({ summary: 'Get reports (filtered by user role)' })
  @ApiResponse({ status: 200, description: 'Returns reports based on user role' })
  async getReports(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role,
    @Query() getReportDto: GetReportDto
  ) {
    console.log(`[ReportsController] Fetching reports for ${role} with ID ${userId}`);
    if (role === Role.ADMIN) {
      return this.reportsService.getAllReports(getReportDto);
    }
    return this.reportsService.getUserReports(userId, getReportDto);
  }

  // Get a single report by ID (route param, not query)
  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Returns report if authorized' })
  async getReportById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ): Promise<Report> {
    console.log(`[ReportsController] Fetching report ${id} for user ${userId}`);
    const report = await this.reportsService.getReportById(id);
    
    if (role !== Role.ADMIN && report.userId !== userId) {
      console.warn(`[ReportsController] Unauthorized access attempt to report ${id} by user ${userId}`);
      throw new ForbiddenException('You can only view your own reports');
    }
    
    return report;
  }

  // Update report partially by ID
  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ): Promise<Report> {
    console.log(`[ReportsController] Updating report ${id} by user ${userId}`);
    const report = await this.reportsService.getReportById(id);
    
    if (role !== Role.ADMIN && report.userId !== userId) {
      console.warn(`[ReportsController] Unauthorized update attempt to report ${id} by user ${userId}`);
      throw new ForbiddenException('You can only update your own reports');
    }
    
    return this.reportsService.update(id, updateReportDto);
  }

  // Delete report by ID
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete report (Admin only)' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser('role') role: Role
  ): Promise<void> {
    console.log(`[ReportsController] Admin deleting report ${id}`);
    return this.reportsService.remove(id);
  }
}
