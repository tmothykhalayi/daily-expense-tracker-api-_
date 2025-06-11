import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 100.50 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Groceries' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoryId: number;
}
