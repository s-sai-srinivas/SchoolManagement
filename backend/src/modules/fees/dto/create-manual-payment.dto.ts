import { IsUUID, IsInt, IsPositive, Min, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PaymentMode {
    CASH = 'CASH',
    CHEQUE = 'CHEQUE',
}

export class CreateManualPaymentDto {
    @IsUUID()
    studentId: string;

    @IsInt()
    @IsPositive()
    amountPaise: number; // Amount in paise

    @IsInt()
    @Min(1)
    installmentNo: number; // Installment number (1, 2, 3, etc.)

    @IsEnum(PaymentMode)
    paymentMode: PaymentMode; // CASH or CHEQUE

    @IsOptional()
    @IsString()
    receiptNumber?: string; // Optional receipt number, will be auto-generated if not provided
}



