import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'The user ID who created the expense',
    example: 1
  })
  user_id: number;

  @ApiProperty({
    description: 'Amount spent',
    example: 45.99,
    minimum: 0
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Category of the expense',
    example: 'Transportation',
    enum: ['Transportation', 'Food', 'Utilities', 'Entertainment']
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Date of the expense',
    example: '2025-05-29'
  })
  @IsDateString()
  date: string;  

  @ApiProperty({
    description: 'Description of the expense',
    example: 'Uber ride to airport'
  })
  @IsOptional()
  @IsString()
  description?: string;
}
