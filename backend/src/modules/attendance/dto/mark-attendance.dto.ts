import { IsUUID, IsEnum, IsDateString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
    @IsUUID()
    studentId: string;

    @IsDateString()
    date: string; // YYYY-MM-DD format

    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;
}



