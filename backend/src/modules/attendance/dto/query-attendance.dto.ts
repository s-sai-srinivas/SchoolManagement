import { IsOptional, IsDateString, IsString, IsUUID, Matches } from 'class-validator';

export class QueryAttendanceDto {
    @IsOptional()
    @IsDateString()
    startDate?: string; // YYYY-MM-DD format

    @IsOptional()
    @IsDateString()
    endDate?: string; // YYYY-MM-DD format

    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/, {
        message: 'Month must be in YYYY-MM format',
    })
    month?: string; // YYYY-MM format

    @IsOptional()
    @IsString()
    class?: string;

    @IsOptional()
    @IsString()
    section?: string;

    @IsOptional()
    @IsUUID()
    studentId?: string;
}



