import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class QueryUsersDto {
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsUUID()
    schoolId?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
