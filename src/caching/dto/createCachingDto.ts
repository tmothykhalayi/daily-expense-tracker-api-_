import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCachingDto {
  @ApiProperty({ description: 'Cache key', example: 'user:123' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Cache value', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'TTL in seconds', example: 60, required: false })
  @IsOptional()
  @IsNumber()
  ttl?: number;
}
