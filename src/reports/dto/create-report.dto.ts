

import { IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  userId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  generated_at?: string;
}
