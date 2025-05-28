import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetReportDto } from './dto/get-report.dto';

export interface Report {
  id: number;
  startDate: string;
  endDate: string;
  userId: number;
}

@Injectable()
export class ReportsService {
  private reports: Report[] = [];
  private reportIdCounter = 1;

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    const newReport: Report = {
      id: this.reportIdCounter++,
      userId: createReportDto.userId,
      startDate: createReportDto.startDate,
      endDate: createReportDto.endDate,
    };

    this.reports.push(newReport);
    return newReport;
  }
  // Get all reports with optional filters

  async getAllReports(getReportDto: GetReportDto): Promise<Report[]> {
    const { userId, startDate, endDate } = getReportDto;

    return this.reports.filter((report) => {
      const reportStart = new Date(report.startDate);
      const reportEnd = new Date(report.endDate);
      if (userId && report.userId !== userId) return false;
      if (startDate && reportEnd < new Date(startDate)) return false;
      if (endDate && reportStart > new Date(endDate)) return false;
      return true;
    });
  }
  // Get a single report by ID

  async getReportById(id: number): Promise<Report> {
    const report = this.reports.find(report => report.id === id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  // Update report partially by ID
  async updateReport(id: number, updateDto: UpdateReportDto): Promise<Report> {
    const report = await this.getReportById(id);

    const updatedReport: Report = {
      ...report,
      ...updateDto,
    };

    const index = this.reports.findIndex(r => r.id === id);
    this.reports[index] = updatedReport;

    return updatedReport;
  }

  async deleteReport(id: number): Promise<void> {
    const index = this.reports.findIndex(report => report.id === id);
    if (index === -1) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    this.reports.splice(index, 1);
  }


  //update report by ID
  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    return this.updateReport(id, updateReportDto);
  }
  
  //delete report by ID
  async remove(id: number): Promise<void> {
    await this.deleteReport(id);
  } 

  
}
