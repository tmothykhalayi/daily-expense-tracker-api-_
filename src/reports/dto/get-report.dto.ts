import { IsInt, IsOptional, IsDateString } from 'class-validator';

/**
 * Data transfer object for retrieving expense reports.
 * 
 * @class GetReportDto
 * 
 * @property {number} [userId] - Optional. The ID of the user whose reports to retrieve.
 * @ApiProperty({ required: false, type: Number, description: 'ID of the user whose reports to retrieve' })
 * 
 * @property {string} [startDate] - Optional. The start date for the report period (ISO date string).
 * @ApiProperty({ required: false, type: String, description: 'Start date for the report period (ISO date string)' })
 * 
 * @property {string} [endDate] - Optional. The end date for the report period (ISO date string).
 * @ApiProperty({ required: false, type: String, description: 'End date for the report period (ISO date string)' })
 */
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
