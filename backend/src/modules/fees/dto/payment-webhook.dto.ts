import { IsString, IsObject, IsOptional } from 'class-validator';

export class PaymentWebhookDto {
    @IsString()
    razorpay_order_id: string;

    @IsString()
    razorpay_payment_id: string;

    @IsString()
    razorpay_signature: string;

    @IsOptional()
    @IsObject()
    metadata?: any;
}
