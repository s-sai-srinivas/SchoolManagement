import { IsString, IsDateString, IsArray, ValidateNested, ArrayMinSize, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

class AttendanceRecordDto {
    @IsUUID()
    studentId: string;

    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;
}

export class BulkMarkAttendanceDto {
    @IsString()
    class: string;

    @IsString()
    section: string;

    @IsDateString()
    date: string; // YYYY-MM-DD format

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecordDto)
    records: AttendanceRecordDto[];
}

