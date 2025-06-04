import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, IsInt, IsDateString } from 'class-validator';


export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsOptional()
  @IsInt()
  user_id?: number;
   @ApiProperty({
      description: 'The start date of the report',
      example: '2023-01-01',
      type: Date})

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsDateString()
  generated_at?: string;
}
