import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity'

export class CreateUserDto {
  @ApiProperty({
      description: 'The name of the user',
      example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
      description: 'The email address of the user',
      example: 'timothykhalayi@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
      description: 'The password for the user account',
      example: '@2027B3YONd',
      minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
      description: 'The role of the user',
      enum: UserRole,
      default: UserRole.USER,
      example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
