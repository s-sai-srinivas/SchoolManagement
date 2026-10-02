import {
    Injectable,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';

@Injectable()
export class FeesService {
    constructor(private prisma: PrismaService) { }

    // ====== FEE STRUCTURE ======

    async createFeeStructure(createFeeStructureDto: CreateFeeStructureDto) {
        // Check if fee structure already exists for this school
        const existing = await this.prisma.feeStructure.findFirst({
            where: {
                schoolId: createFeeStructureDto.schoolId,
            },
        });

        if (existing) {
            throw new ConflictException(
                'Fee structure already exists for this school',
            );
        }

        const feeStructure = await this.prisma.feeStructure.create({
            data: createFeeStructureDto,
            select: {
                id: true,
                schoolId: true,
                annualAmountPaise: true,
                installments: true,
                installmentDates: true,
                createdAt: true,
            },
        });

        return {
            ...feeStructure,
            annualAmountRupees: feeStructure.annualAmountPaise / 100,
        };
    }

    async findFeeStructure(schoolId: string) {
        const feeStructure = await this.prisma.feeStructure.findFirst({
            where: {
                schoolId,
            },
            select: {
                id: true,
                annualAmountPaise: true,
                installments: true,
                installmentDates: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!feeStructure) {
            throw new NotFoundException('Fee structure not found for this school');
        }

        return {
            ...feeStructure,
            annualAmountRupees: feeStructure.annualAmountPaise / 100,
        };
    }

    async updateFeeStructure(
        id: string,
        updateFeeStructureDto: UpdateFeeStructureDto,
    ) {
        const feeStructure = await this.prisma.feeStructure.findUnique({
            where: { id },
        });

        if (!feeStructure) {
            throw new NotFoundException('Fee structure not found');
        }

        const updated = await this.prisma.feeStructure.update({
            where: { id },
            data: updateFeeStructureDto,
            select: {
                id: true,
                annualAmountPaise: true,
                installments: true,
                installmentDates: true,
                updatedAt: true,
            },
        });

        return {
            ...updated,
            annualAmountRupees: updated.annualAmountPaise / 100,
        };
    }

    // ====== PAYMENTS ======

    async getPendingFees(studentId: string, user?: any) {
        if (user?.role === 'PARENT') {
            const link = await this.prisma.studentParent.findFirst({
                where: { parentId: user.id, studentId },
            });
            if (!link) {
                throw new ForbiddenException('Not authorized to view this student');
            }
        }

        const student = await this.prisma.student.findFirst({
            where: { id: studentId, deletedAt: null },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Get fee structure for student's school
        const feeStructure = await this.prisma.feeStructure.findFirst({
            where: {
                schoolId: student.schoolId,
            },
        });

        if (!feeStructure) {
            throw new NotFoundException('Fee structure not found for this school');
        }

        // Calculate total paid
        const payments = await this.prisma.feePayment.findMany({
            where: {
                studentId,
                status: 'COMPLETED',
            },
            select: {
                amountPaise: true,
            },
        });

        const totalPaidPaise = payments.reduce(
            (sum, p) => sum + p.amountPaise,
            0,
        );
        const pendingPaise = feeStructure.annualAmountPaise - totalPaidPaise;

        return {
            studentId,
            studentName: student.name,
            class: student.class,
            section: student.section,
            schoolName: student.school.name,
            annualFeePaise: feeStructure.annualAmountPaise,
            annualFeeRupees: feeStructure.annualAmountPaise / 100,
            installments: feeStructure.installments,
            installmentDates: feeStructure.installmentDates,
            totalPaidPaise,
            totalPaidRupees: totalPaidPaise / 100,
            pendingPaise: Math.max(0, pendingPaise),
            pendingRupees: Math.max(0, pendingPaise / 100),
        };
    }

    async createPaymentOrder(createPaymentOrderDto: CreatePaymentOrderDto, user?: any) {
        if (user?.role === 'PARENT') {
            const link = await this.prisma.studentParent.findFirst({
                where: { parentId: user.id, studentId: createPaymentOrderDto.studentId },
            });
            if (!link) {
                throw new ForbiddenException('Not authorized to pay for this student');
            }
        }

        const student = await this.prisma.student.findFirst({
            where: {
                id: createPaymentOrderDto.studentId,
                deletedAt: null,
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // TODO: Replace with actual Razorpay order creation
        // Placeholder implementation
        const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const payment = await this.prisma.feePayment.create({
            data: {
                studentId: createPaymentOrderDto.studentId,
                amountPaise: createPaymentOrderDto.amountPaise,
                installmentNo: createPaymentOrderDto.installmentNo,
                razorpayOrderId,
                status: 'PENDING',
            },
            select: {
                id: true,
                razorpayOrderId: true,
                amountPaise: true,
                installmentNo: true,
                status: true,
                createdAt: true,
            },
        });

        return {
            ...payment,
            amountRupees: payment.amountPaise / 100,
            message:
                'Placeholder order created. Replace with actual Razorpay integration.',
        };
    }

    async handlePaymentWebhook(
        paymentWebhookDto: PaymentWebhookDto,
        signature: string,
    ) {
        // 1. Verify signature (placeholder)
        const isValid = this.verifyRazorpaySignature(paymentWebhookDto, signature);
        if (!isValid) {
            throw new UnauthorizedException('Invalid signature');
        }

        // 2. Check if payment already processed (idempotency)
        const existingPayment = await this.prisma.feePayment.findUnique({
            where: { razorpayPaymentId: paymentWebhookDto.razorpay_payment_id },
        });

        if (existingPayment?.status === 'COMPLETED') {
            return {
                message: 'Payment already processed',
                paymentId: existingPayment.id,
            };
        }

        // 3. Process in database transaction
        return await this.prisma.$transaction(async (tx) => {
            // Update payment status
            const payment = await tx.feePayment.update({
                where: { razorpayOrderId: paymentWebhookDto.razorpay_order_id },
                data: {
                    razorpayPaymentId: paymentWebhookDto.razorpay_payment_id,
                    razorpaySignature: signature,
                    status: 'COMPLETED',
                    paidAt: new Date(),
                },
                include: {
                    student: {
                        include: {
                            parents: {
                                select: {
                                    parentId: true,
                                },
                            },
                        },
                    },
                },
            });

            // Generate receipt number (simple auto-increment)
            const receiptNumber = `FEE-${Date.now()}-${payment.id.substring(0, 8)}`;

            // Placeholder for PDF receipt generation
            const receiptUrl = `/receipts/${payment.id}.pdf`;

            // Update with receipt info
            await tx.feePayment.update({
                where: { id: payment.id },
                data: {
                    receiptUrl,
                    receiptNumber,
                },
            });

            return {
                id: payment.id,
                status: payment.status,
                amountPaise: payment.amountPaise,
                amountRupees: payment.amountPaise / 100,
                receiptNumber,
                receiptUrl,
                paidAt: payment.paidAt,
            };
        });
    }

    private verifyRazorpaySignature(
        payload: PaymentWebhookDto,
        signature: string,
    ): boolean {
        // TODO: Implement actual Razorpay signature verification
        // Placeholder: Always return true in development
        if (process.env.NODE_ENV === 'development' || !signature) {
            return true;
        }

        // In production, implement proper signature verification:
        // const crypto = require('crypto');
        // const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        // const expectedSignature = crypto
        //   .createHmac('sha256', secret)
        //   .update(JSON.stringify(payload))
        //   .digest('hex');
        // return expectedSignature === signature;

        throw new Error('Razorpay signature verification not implemented');
    }

    async getPaymentReceipt(id: string, user?: any) {
        if (user?.role === 'PARENT') {
            const link = await this.prisma.studentParent.findFirst({
                where: { parentId: user.id, student: { feePayments: { some: { id } } } },
            });
            if (!link) {
                throw new ForbiddenException('Not authorized to view this receipt');
            }
        }

        const payment = await this.prisma.feePayment.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        name: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status !== 'COMPLETED') {
            throw new BadRequestException('Payment not completed yet');
        }

        return {
            id: payment.id,
            receiptNumber: payment.receiptNumber,
            receiptUrl: payment.receiptUrl,
            amountPaise: payment.amountPaise,
            amountRupees: payment.amountPaise / 100,
            installmentNo: payment.installmentNo,
            paidAt: payment.paidAt,
            status: payment.status,
            student: {
                name: payment.student.name,
                admissionNo: payment.student.admissionNo,
                class: payment.student.class,
                section: payment.student.section,
                schoolName: payment.student.school.name,
            },
        };
    }

    async createManualPayment(createManualPaymentDto: CreateManualPaymentDto) {
        const student = await this.prisma.student.findFirst({
            where: {
                id: createManualPaymentDto.studentId,
                deletedAt: null,
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Generate receipt number if not provided
        const receiptNumber = createManualPaymentDto.receiptNumber || `FEE-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        // Placeholder for PDF receipt generation
        const receiptUrl = `/receipts/manual-${Date.now()}.pdf`;

        const payment = await this.prisma.feePayment.create({
            data: {
                studentId: createManualPaymentDto.studentId,
                amountPaise: createManualPaymentDto.amountPaise,
                installmentNo: createManualPaymentDto.installmentNo,
                status: 'COMPLETED',
                paidAt: new Date(),
                receiptNumber,
                receiptUrl,
                paymentMode: createManualPaymentDto.paymentMode,
            },
            include: {
                student: {
                    select: {
                        name: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                    },
                },
            },
        });

        return {
            id: payment.id,
            studentId: payment.studentId,
            studentName: payment.student.name,
            admissionNo: payment.student.admissionNo,
            class: payment.student.class,
            section: payment.student.section,
            amountPaise: payment.amountPaise,
            amountRupees: payment.amountPaise / 100,
            installmentNo: payment.installmentNo,
            status: payment.status,
            receiptNumber: payment.receiptNumber,
            receiptUrl: payment.receiptUrl,
            paymentMode: payment.paymentMode,
            paidAt: payment.paidAt,
            createdAt: payment.createdAt,
        };
    }

    async listPayments(queryPaymentsDto: QueryPaymentsDto, user?: any) {
        const { studentId, schoolId, status } = queryPaymentsDto;

        // Parents can only see payments for their own children
        let childIds: string[] | undefined;
        if (user?.role === 'PARENT') {
            const links = await this.prisma.studentParent.findMany({
                where: { parentId: user.id },
                select: { studentId: true },
            });
            childIds = links.map((l) => l.studentId);
            if (studentId && !childIds.includes(studentId)) {
                return [];
            }
        }

        const payments = await this.prisma.feePayment.findMany({
            where: {
                ...(studentId && { studentId }),
                ...(childIds && !studentId && { studentId: { in: childIds } }),
                ...(status && { status }),
                ...(schoolId && {
                    student: {
                        schoolId,
                    },
                }),
            },
            include: {
                student: {
                    select: {
                        name: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return payments.map((p) => ({
            id: p.id,
            studentId: p.studentId,
            studentName: p.student.name,
            admissionNo: p.student.admissionNo,
            class: p.student.class,
            section: p.student.section,
            amountPaise: p.amountPaise,
            amountRupees: p.amountPaise / 100,
            installmentNo: p.installmentNo,
            status: p.status,
            receiptNumber: p.receiptNumber,
            paidAt: p.paidAt,
            createdAt: p.createdAt,
        }));
    }
}
