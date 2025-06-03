import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCachingDto {
  @ApiProperty({
    description: 'The key to store in cache',
    example: 'user:123'
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'The value to store in cache',
    example: '{"name": "Timothy", "age": 21}'
  })
  @IsNotEmpty()
  value: any;

  @ApiProperty({
    description: 'Time to live in seconds',
    example: 3600,
    required: false
  })
  @IsNumber()
  @IsOptional()
  ttl?: number;
}
