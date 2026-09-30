import { IsOptional, IsUUID, IsString } from 'class-validator';

export class QueryStudentsDto {
    @IsOptional()
    @IsString()
    class?: string;

    @IsOptional()
    @IsString()
    section?: string;

    @IsOptional()
    @IsUUID()
    schoolId?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
