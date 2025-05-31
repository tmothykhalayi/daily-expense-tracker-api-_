import { IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateReportDto {
  userId: number;
  startDate: Date;
  endDate: Date;
}
