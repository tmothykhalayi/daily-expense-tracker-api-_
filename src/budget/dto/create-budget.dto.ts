import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'User ID who owns this budget',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({
    description: 'Category ID for this budget (optional)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({
    description: 'Budget amount',
    example: 1000.00,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Budget start date',
    example: '2025-01-01'
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Budget end date',
    example: '2025-12-31'
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
