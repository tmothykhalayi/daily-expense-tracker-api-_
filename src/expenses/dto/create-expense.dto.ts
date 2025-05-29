import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  date: string;  // ISO Date string

  @IsOptional()
  @IsString()
  description?: string;
}
