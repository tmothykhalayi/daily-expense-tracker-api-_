import { IsEmail, IsEnum, IsNotEmpty,MinLength, IsString, IsStrongPassword } from "class-validator";
export enum Role {
    ADMIN = "admin",
    USER = "user"
}
export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
   @IsEnum(["USER", "ADMIN"], {
        message: 'Valid role required'
    })

  @IsNotEmpty()
  @MinLength(6 )
  password: string;

 @IsEnum(["USER", "ADMIN"], {
        message: 'Valid role required'
    })
    role: Role = Role.USER;
}
