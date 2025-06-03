import { IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  userId: number;
  @ApiProperty({
    description: 'The start date of the report',
    example: '2023-01-01',
    type: Date
  })
  startDate: Date;
  endDate: Date;
}
