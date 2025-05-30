import { IsEmail, IsEnum, IsNotEmpty,MinLength, IsString, IsStrongPassword } from "class-validator";
export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}
export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6 )
  password: string;

 @IsEnum(["USER", "ADMIN"], {
        message: 'Valid role required'
    })
    role: Role = Role.USER;
}
