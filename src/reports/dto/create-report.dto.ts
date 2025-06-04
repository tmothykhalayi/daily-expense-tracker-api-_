import { IsInt, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'The ID of the user creating the report',
    example: 123,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'The start date of the report',
    example: '2023-01-01',
    type: String,
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'The end date of the report',
    example: '2023-01-31',
    type: String,
  })
  @IsDateString()
  endDate: string;
}
