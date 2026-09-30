import { IsUUID, IsInt, IsPositive, Min } from 'class-validator';

export class CreatePaymentOrderDto {
    @IsUUID()
    studentId: string;

    @IsInt()
    @IsPositive()
    amountPaise: number; // Amount in paise

    @IsInt()
    @Min(1)
    installmentNo: number; // Installment number (1, 2, 3, etc.)
}
