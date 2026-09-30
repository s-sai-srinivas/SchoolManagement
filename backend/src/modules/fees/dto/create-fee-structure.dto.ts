import { IsInt, IsUUID, IsPositive, Min, IsArray } from 'class-validator';

export class CreateFeeStructureDto {
    @IsUUID()
    schoolId: string;

    @IsInt()
    @IsPositive()
    annualAmountPaise: number; // Amount in paise (e.g., 50000 paise = ₹500)

    @IsInt()
    @Min(1)
    installments: number; // Number of installments

    @IsArray()
    installmentDates: string[]; // Array of date strings (e.g., ["2024-04-01", "2024-07-01"])
}
