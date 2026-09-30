import {
    Controller,
    Get,
    Query,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    // ==================== FEE REPORTS ====================

    @Get('fees/collection')
    @Roles(UserRole.ADMIN)
    async getFeeCollection(
        @CurrentUser() user: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('groupBy') groupBy?: 'daily' | 'monthly' | 'yearly',
    ) {
        return this.reportsService.getFeeCollection(user.schoolId, {
            startDate,
            endDate,
            groupBy,
        });
    }

    @Get('fees/collection/export')
    @Roles(UserRole.ADMIN)
    async exportFeeCollection(
        @Res({ passthrough: false }) res: Response,
        @CurrentUser() user: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('groupBy') groupBy?: 'daily' | 'monthly' | 'yearly',
    ) {
        const data = await this.reportsService.getFeeCollection(user.schoolId, {
            startDate,
            endDate,
            groupBy,
        });

        const excelData = data.collections.map((c) => ({
            Period: c.period,
            'Transaction Count': c.count,
            'Amount (₹)': c.amountRupees,
        }));

        const buffer = await this.reportsService.exportToExcel(
            excelData,
            [
                { header: 'Period', key: 'Period', width: 15 },
                { header: 'Transaction Count', key: 'Transaction Count', width: 20 },
                { header: 'Amount (₹)', key: 'Amount (₹)', width: 15 },
            ],
            'Fee Collection',
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="fee_collection_${data.period.startDate}_${data.period.endDate}.xlsx"`,
        );
        res.send(buffer);
    }

    @Get('fees/outstanding')
    @Roles(UserRole.ADMIN)
    async getOutstandingFees(
        @CurrentUser() user: any,
        @Query('class') className?: string,
        @Query('section') section?: string,
    ) {
        return this.reportsService.getOutstandingFees(user.schoolId, {
            class: className,
            section,
        });
    }

    @Get('fees/outstanding/export')
    @Roles(UserRole.ADMIN)
    async exportOutstandingFees(
        @Res({ passthrough: false }) res: Response,
        @CurrentUser() user: any,
        @Query('class') className?: string,
        @Query('section') section?: string,
    ) {
        const data = await this.reportsService.getOutstandingFees(user.schoolId, {
            class: className,
            section,
        });

        const excelData = data.students.map((s) => ({
            'Student Name': s.studentName,
            Class: s.class,
            Section: s.section,
            'Annual Fee (₹)': s.annualFeePaise / 100,
            'Paid (₹)': s.paidPaise / 100,
            'Outstanding (₹)': s.outstandingRupees,
        }));

        const buffer = await this.reportsService.exportToExcel(
            excelData,
            [
                { header: 'Student Name', key: 'Student Name', width: 25 },
                { header: 'Class', key: 'Class', width: 10 },
                { header: 'Section', key: 'Section', width: 10 },
                { header: 'Annual Fee (₹)', key: 'Annual Fee (₹)', width: 15 },
                { header: 'Paid (₹)', key: 'Paid (₹)', width: 15 },
                { header: 'Outstanding (₹)', key: 'Outstanding (₹)', width: 15 },
            ],
            'Outstanding Fees',
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="outstanding_fees_${Date.now()}.xlsx"`,
        );
        res.send(buffer);
    }

    @Get('fees/defaulters')
    @Roles(UserRole.ADMIN)
    async getFeeDefaulters(@CurrentUser() user: any) {
        return this.reportsService.getFeeDefaulters(user.schoolId);
    }

    @Get('fees/defaulters/export')
    @Roles(UserRole.ADMIN)
    async exportFeeDefaulters(
        @CurrentUser() user: any,
        @Res({ passthrough: false }) res: Response,
    ) {
        const data = await this.reportsService.getFeeDefaulters(user.schoolId);

        const excelData = data.defaulters.map((d) => ({
            'Student Name': d.studentName,
            Class: d.class,
            Section: d.section,
            'Outstanding (₹)': d.outstandingRupees,
            'Last Payment Date': d.lastPaymentDate || 'Never',
            'Days Since Last Payment': d.daysSinceLastPayment || 'N/A',
        }));

        const buffer = await this.reportsService.exportToExcel(
            excelData,
            [
                { header: 'Student Name', key: 'Student Name', width: 25 },
                { header: 'Class', key: 'Class', width: 10 },
                { header: 'Section', key: 'Section', width: 10 },
                { header: 'Outstanding (₹)', key: 'Outstanding (₹)', width: 15 },
                { header: 'Last Payment Date', key: 'Last Payment Date', width: 20 },
                {
                    header: 'Days Since Last Payment',
                    key: 'Days Since Last Payment',
                    width: 25,
                },
            ],
            'Fee Defaulters',
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="fee_defaulters_${Date.now()}.xlsx"`,
        );
        res.send(buffer);
    }

    // ==================== ATTENDANCE REPORTS (PLACEHOLDERS) ====================

    @Get('attendance/daily')
    @Roles(UserRole.ADMIN)
    async getDailyAttendance(
        @CurrentUser() user: any,
        @Query('date') date?: string,
        @Query('class') className?: string,
        @Query('section') section?: string,
    ) {
        return this.reportsService.getDailyAttendance(
            user.schoolId,
            date || new Date().toISOString().split('T')[0],
            { class: className, section },
        );
    }

    @Get('attendance/monthly')
    @Roles(UserRole.ADMIN)
    async getMonthlyAttendance(
        @CurrentUser() user: any,
        @Query('month') month?: string,
        @Query('studentId') studentId?: string,
    ) {
        const currentMonth = month || new Date().toISOString().slice(0, 7);
        return this.reportsService.getMonthlyAttendance(
            user.schoolId,
            currentMonth,
            studentId,
        );
    }

    @Get('attendance/defaulters')
    @Roles(UserRole.ADMIN)
    async getAttendanceDefaulters(@CurrentUser() user: any) {
        return this.reportsService.getAttendanceDefaulters(user.schoolId);
    }

    @Get('attendance/monthly/export')
    @Roles(UserRole.ADMIN)
    async exportMonthlyAttendance(
        @Res({ passthrough: false }) res: Response,
        @CurrentUser() user: any,
        @Query('month') month?: string,
    ) {
        const currentMonth = month || new Date().toISOString().slice(0, 7);
        const buffer = await this.reportsService.exportMonthlyAttendanceSheet(
            user.schoolId,
            currentMonth,
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="attendance_${currentMonth}.xlsx"`,
        );
        res.send(buffer);
    }
}
