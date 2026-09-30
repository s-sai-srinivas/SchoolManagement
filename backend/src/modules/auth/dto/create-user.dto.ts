import { IsEmail, IsString, IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsUUID()
    schoolId: string;
}
