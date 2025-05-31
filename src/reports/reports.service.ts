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
    const report = this.reportsRepository.create(createReportDto);
    return this.reportsRepository.save(report);
  }

  async getAllReports(getReportDto: GetReportDto): Promise<Report[]> {
    const query = this.reportsRepository.createQueryBuilder('report');
    
    if (getReportDto.userId) {
      query.andWhere('report.userId = :userId', { userId: getReportDto.userId });
    }
    
    if (getReportDto.startDate) {
      query.andWhere('report.startDate >= :startDate', { startDate: getReportDto.startDate });
    }
    
    if (getReportDto.endDate) {
      query.andWhere('report.endDate <= :endDate', { endDate: getReportDto.endDate });
    }
    
    return query.getMany();
  }

  async getReportById(id: number): Promise<Report> {
    const report = await this.reportsRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.getReportById(id);
    Object.assign(report, updateReportDto);
    return this.reportsRepository.save(report);
  }

  async remove(id: number): Promise<void> {
    const result = await this.reportsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }
}
