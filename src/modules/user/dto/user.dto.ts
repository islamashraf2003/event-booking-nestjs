import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";


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

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsStrongPassword()
    password?: string;
}
