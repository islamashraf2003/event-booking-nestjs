import { IsEmail, IsNotEmpty, isNotEmpty, IsString, IsStrongPassword } from "class-validator";


export class UserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password: string
}