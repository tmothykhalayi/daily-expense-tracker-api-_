import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetReportDto } from './dto/get-report.dto';
import { Report } from './entities/report.entity'; 
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('reports')
@ApiBearerAuth()
@ApiTags('reports')

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Create a new report
  @Post()
  async createReport(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.reportsService.createReport(createReportDto);
  }
  
  // Get all reports
  @Get()
  async getReports(@Query() getReportDto: GetReportDto): Promise<Report[]> {
    return this.reportsService.getAllReports(getReportDto);
  }

  // Get a single report by ID (route param, not query)
  @Get(':id')
  async getReportById(@Param('id') id: number): Promise<Report> {
    return this.reportsService.getReportById(id);
  }

  // Update report partially by ID
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto): Promise<Report> {
    return this.reportsService.update(+id, updateReportDto);
  }

  // Delete report by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.reportsService.remove(+id);
  }
}
