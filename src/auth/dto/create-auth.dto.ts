import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'nandwatimothykhalayi@gmail.com',
    required:true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;


  @ApiProperty({
    description: 'The password for the user account',
    example: 'password123',
    required:true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
