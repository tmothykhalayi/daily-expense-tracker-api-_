import { IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportTimeRange {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export class GetReportDto {
  @ApiPropertyOptional({
    description: 'Time range of the report (weekly, monthly, yearly, custom)',
    enum: ReportTimeRange,
    example: 'yearly',
  })
  @IsOptional()
  timeRange?: ReportTimeRange;

  @ApiPropertyOptional({
    description: 'Start date of the report period in YYYY-MM-DD format (no time)',
    example: '2023-06-11',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format',
  })
  startDate?: string; // ✅ Changed from Date to string

  @ApiPropertyOptional({
    description: 'End date of the report period in YYYY-MM-DD format (no time)',
    example: '2023-06-30',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format',
  })
  endDate?: string; // ✅ Stay as string
}
