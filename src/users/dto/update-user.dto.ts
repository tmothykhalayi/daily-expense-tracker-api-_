import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsOptional, MinLength, IsString, Length } from 'class-validator';


import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name: string;


  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 50)
  password?: string;


  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}




