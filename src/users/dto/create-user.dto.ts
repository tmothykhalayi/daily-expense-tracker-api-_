import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsString, IsStrongPassword } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}
export class CreateUserDto {
  @ApiProperty({
      description: 'The name of the user',
      example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
      description: 'The email address of the user',
      example: 'user@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
      description: 'The password for the user account',
      example: '@2027B3YONd',
      minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
      description: 'The role of the user',
      enum: Role,
      default: Role.USER,
      example: Role.USER,
  })
  @IsEnum(["USER", "ADMIN"], {
      message: 'Valid role required'
  })
  role: Role = Role.USER;
}
