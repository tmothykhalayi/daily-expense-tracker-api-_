import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsOptional, MinLength, IsString, Length } from 'class-validator';


import { UserRole } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'User name', minLength: 3, maxLength: 50, required: false })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({ description: 'User email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User password', minLength: 6, maxLength: 50, required: false })
  @IsOptional()
  @IsString()
  @Length(6, 50)
  password?: string;

  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}




