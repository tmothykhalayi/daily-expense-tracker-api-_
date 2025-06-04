import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiProperty({
    description: 'Optional update for user ID',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: 'Optional update for the start date of the report',
    example: '2023-01-01',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Optional update for the end date of the report',
    example: '2023-01-31',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'The date and time the report was generated',
    example: '2023-01-31T15:00:00Z',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  generatedAt?: string;
}
