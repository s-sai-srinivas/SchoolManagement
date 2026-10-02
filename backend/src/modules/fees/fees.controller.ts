import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    Headers,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('fees')
export class FeesController {
    constructor(private readonly feesService: FeesService) { }

    // ====== FEE STRUCTURE ======

    @Post('structure')
    @Roles(UserRole.ADMIN)
    createFeeStructure(@Body() createFeeStructureDto: CreateFeeStructureDto) {
        return this.feesService.createFeeStructure(createFeeStructureDto);
    }

    @Get('structure/:schoolId')
    @Roles(UserRole.ADMIN)
    findFeeStructure(@Param('schoolId') schoolId: string) {
        return this.feesService.findFeeStructure(schoolId);
    }

    @Patch('structure/:id')
    @Roles(UserRole.ADMIN)
    updateFeeStructure(
        @Param('id') id: string,
        @Body() updateFeeStructureDto: UpdateFeeStructureDto,
    ) {
        return this.feesService.updateFeeStructure(id, updateFeeStructureDto);
    }

    // ====== PAYMENTS ======

    @Get('student/:studentId/pending')
    @Roles(UserRole.ADMIN, UserRole.PARENT)
    getPendingFees(@Param('studentId') studentId: string, @CurrentUser() user: any) {
        return this.feesService.getPendingFees(studentId, user);
    }

    @Post('create-order')
    @Roles(UserRole.PARENT)
    createPaymentOrder(@Body() createPaymentOrderDto: CreatePaymentOrderDto, @CurrentUser() user: any) {
        return this.feesService.createPaymentOrder(createPaymentOrderDto, user);
    }

    @Post('webhook')
    @Public()
    handlePaymentWebhook(
        @Body() paymentWebhookDto: PaymentWebhookDto,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        return this.feesService.handlePaymentWebhook(paymentWebhookDto, signature);
    }

    @Get('payment/:id/receipt')
    @Roles(UserRole.ADMIN, UserRole.PARENT)
    getPaymentReceipt(@Param('id') id: string, @CurrentUser() user: any) {
        return this.feesService.getPaymentReceipt(id, user);
    }

    @Get('payments')
    @Roles(UserRole.ADMIN, UserRole.PARENT)
    listPayments(@Query() queryPaymentsDto: QueryPaymentsDto, @CurrentUser() user: any) {
        return this.feesService.listPayments(queryPaymentsDto, user);
    }

    @Post('manual-entry')
    @Roles(UserRole.ADMIN)
    createManualPayment(@Body() createManualPaymentDto: CreateManualPaymentDto) {
        return this.feesService.createManualPayment(createManualPaymentDto);
    }
}
