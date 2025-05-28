import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class GetReportDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
