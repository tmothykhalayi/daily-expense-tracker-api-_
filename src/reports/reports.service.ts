import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GetReportDto } from './dto/get-report.dto';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    console.log('[ReportsService] Creating new report:', createReportDto);
    const report = this.reportsRepository.create(createReportDto);
    return this.reportsRepository.save(report);
  }

  async getAllReports(getReportDto: GetReportDto): Promise<Report[]> {
    console.log('[ReportsService] Getting all reports with filters:', getReportDto);
    const query = this.reportsRepository.createQueryBuilder('report');
    
    this.applyFilters(query, getReportDto);
    
    return query.getMany();
  }

  async getUserReports(userId: number, getReportDto: GetReportDto): Promise<Report[]> {
    console.log(`[ReportsService] Getting reports for user ${userId}`);
    const query = this.reportsRepository.createQueryBuilder('report')
      .where('report.userId = :userId', { userId });
    
    this.applyFilters(query, getReportDto);
    
    return query.getMany();
  }

  private applyFilters(query: any, getReportDto: GetReportDto) {
    if (getReportDto.startDate) {
      query.andWhere('report.startDate >= :startDate', { startDate: getReportDto.startDate });
    }
    
    if (getReportDto.endDate) {
      query.andWhere('report.endDate <= :endDate', { endDate: getReportDto.endDate });
    }
    
    query.orderBy('report.createdAt', 'DESC');
  }

  async getReportById(id: number): Promise<Report> {
    console.log(`[ReportsService] Getting report by ID: ${id}`);
    const report = await this.reportsRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    console.log(`[ReportsService] Updating report ${id}:`, updateReportDto);
    const report = await this.getReportById(id);
    Object.assign(report, updateReportDto);
    return this.reportsRepository.save(report);
  }

  async remove(id: number): Promise<void> {
    console.log(`[ReportsService] Deleting report ${id}`);
    const result = await this.reportsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }
}
