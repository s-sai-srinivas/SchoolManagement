import { IsEmail, IsString, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsEnum(UserRole)
    role: UserRole;
}
