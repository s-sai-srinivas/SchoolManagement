import { IsOptional, IsUUID, IsEnum } from 'class-validator';

enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export class QueryPaymentsDto {
    @IsOptional()
    @IsUUID()
    studentId?: string;

    @IsOptional()
    @IsUUID()
    schoolId?: string;

    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
}
