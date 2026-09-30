import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import * as ExcelJS from 'exceljs';

interface DateRangeDto {
    startDate?: string;
    endDate?: string;
    groupBy?: 'daily' | 'monthly' | 'yearly';
}

interface FilterDto {
    class?: string;
    section?: string;
}

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private attendanceService: AttendanceService,
    ) { }

    // ==================== FEE REPORTS ====================

    async getFeeCollection(schoolId: string, dateRange: DateRangeDto) {
        const { startDate, endDate, groupBy = 'monthly' } = dateRange;

        // Default to current year if no dates provided
        const start = startDate
            ? new Date(startDate)
            : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        // Get all payments in date range
        const payments = await this.prisma.feePayment.findMany({
            where: {
                student: {
                    schoolId,
                    deletedAt: null,
                },
                status: 'COMPLETED',
                paidAt: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                amountPaise: true,
                paidAt: true,
            },
        });

        // Calculate total
        const totalCollected = payments.reduce(
            (sum, p) => sum + p.amountPaise,
            0,
        );

        // Group by period
        const collections = this.groupPaymentsByPeriod(payments, groupBy);

        return {
            period: {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
            },
            totalCollected,
            totalCollectedRupees: totalCollected / 100,
            collections,
        };
    }

    async getOutstandingFees(schoolId: string, filters: FilterDto) {
        const { class: className, section } = filters;

        // Get fee structure for school
        const feeStructure = await this.prisma.feeStructure.findFirst({
            where: { schoolId },
            select: { annualAmountPaise: true },
        });

        const annualFeePaise = feeStructure?.annualAmountPaise || 0;

        // Get students with their payments
        const students = await this.prisma.student.findMany({
            where: {
                schoolId,
                deletedAt: null,
                ...(className && { class: className }),
                ...(section && { section }),
            },
            include: {
                feePayments: {
                    where: {
                        status: 'COMPLETED',
                    },
                    select: {
                        amountPaise: true,
                    },
                },
            },
        });

        const studentsWithOutstanding = students
            .map((student) => {
                const paidPaise = student.feePayments.reduce(
                    (sum, p) => sum + p.amountPaise,
                    0,
                );
                const outstandingPaise = Math.max(0, annualFeePaise - paidPaise);

                return {
                    studentId: student.id,
                    studentName: student.name,
                    class: student.class,
                    section: student.section,
                    annualFeePaise,
                    paidPaise,
                    outstandingPaise,
                    outstandingRupees: outstandingPaise / 100,
                };
            })
            .filter((s) => s.outstandingPaise > 0)
            .sort((a, b) => b.outstandingPaise - a.outstandingPaise);

        const totalOutstanding = studentsWithOutstanding.reduce(
            (sum, s) => sum + s.outstandingPaise,
            0,
        );

        return {
            totalOutstanding,
            totalOutstandingRupees: totalOutstanding / 100,
            count: studentsWithOutstanding.length,
            students: studentsWithOutstanding,
        };
    }

    async getFeeDefaulters(schoolId: string) {
        // Get fee structure for school
        const feeStructure = await this.prisma.feeStructure.findFirst({
            where: { schoolId },
            select: { annualAmountPaise: true },
        });

        const annualFeePaise = feeStructure?.annualAmountPaise || 0;

        // Get students with their payments
        const students = await this.prisma.student.findMany({
            where: {
                schoolId,
                deletedAt: null,
            },
            include: {
                feePayments: {
                    where: {
                        status: 'COMPLETED',
                    },
                    select: {
                        amountPaise: true,
                        paidAt: true,
                    },
                    orderBy: {
                        paidAt: 'desc',
                    },
                    take: 1,
                },
            },
        });

        const defaulters = students
            .map((student) => {
                const paidPaise = student.feePayments.reduce(
                    (sum, p) => sum + p.amountPaise,
                    0,
                );
                const outstandingPaise = Math.max(0, annualFeePaise - paidPaise);

                const lastPayment = student.feePayments[0];
                const lastPaymentDate = lastPayment?.paidAt || null;
                const daysSinceLastPayment = lastPaymentDate
                    ? Math.floor(
                        (Date.now() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24),
                    )
                    : null;

                return {
                    studentId: student.id,
                    studentName: student.name,
                    class: student.class,
                    section: student.section,
                    outstandingPaise,
                    outstandingRupees: outstandingPaise / 100,
                    lastPaymentDate: lastPaymentDate
                        ? lastPaymentDate.toISOString().split('T')[0]
                        : null,
                    daysSinceLastPayment,
                };
            })
            .filter((s) => s.outstandingPaise > 0)
            .sort((a, b) => b.outstandingPaise - a.outstandingPaise);

        const totalOverdue = defaulters.reduce(
            (sum, d) => sum + d.outstandingPaise,
            0,
        );

        return {
            defaulterCount: defaulters.length,
            totalOverdue,
            totalOverdueRupees: totalOverdue / 100,
            defaulters,
        };
    }

    // ==================== ATTENDANCE REPORTS ====================

    async getDailyAttendance(
        schoolId: string,
        date: string,
        filters: FilterDto,
    ) {
        return this.attendanceService.getDailyReport(schoolId, date);
    }

    async getMonthlyAttendance(
        schoolId: string,
        month: string,
        studentId?: string,
    ) {
        return this.attendanceService.getMonthlyReport(schoolId, month);
    }

    async getAttendanceDefaulters(schoolId: string, threshold: number = 75) {
        return this.attendanceService.getDefaulters(schoolId, threshold);
    }

    /**
     * Export monthly attendance sheet to Excel
     */
    async exportMonthlyAttendanceSheet(schoolId: string, month: string) {
        const report = await this.attendanceService.getMonthlyReport(
            schoolId,
            month,
        );

        // Prepare data for Excel
        const columns = [
            { header: 'Student Name', key: 'name', width: 25 },
            { header: 'Admission No', key: 'admissionNo', width: 15 },
            { header: 'Class', key: 'class', width: 10 },
            { header: 'Section', key: 'section', width: 10 },
            { header: 'Total Days', key: 'totalDays', width: 12 },
            { header: 'Present', key: 'present', width: 10 },
            { header: 'Absent', key: 'absent', width: 10 },
            { header: 'Late', key: 'late', width: 10 },
            { header: 'Leave', key: 'leave', width: 10 },
            { header: 'Percentage', key: 'percentage', width: 12 },
        ];

        const data = report.students.map((student: any) => ({
            name: student.name,
            admissionNo: student.admissionNo,
            class: student.class,
            section: student.section,
            totalDays: student.totalDays,
            present: student.present,
            absent: student.absent,
            late: student.late,
            leave: student.leave,
            percentage: `${student.percentage.toFixed(2)}%`,
        }));

        return this.exportToExcel(data, columns, `Attendance_${month}`);
    }

    // ==================== EXCEL EXPORT ====================

    async exportToExcel(data: any[], columns: any[], sheetName: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        // Add columns
        worksheet.columns = columns;

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        // Add data
        worksheet.addRows(data);

        // Auto-fit columns
        worksheet.columns.forEach((column) => {
            if (!column) return;
            let maxLength = 0;
            column.eachCell?.({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    // ==================== HELPER METHODS ====================

    private groupPaymentsByPeriod(
        payments: any[],
        groupBy: 'daily' | 'monthly' | 'yearly',
    ) {
        const grouped = new Map<string, { count: number; amountPaise: number }>();

        payments.forEach((payment) => {
            const date = new Date(payment.paidAt);
            let key: string;

            if (groupBy === 'daily') {
                key = date.toISOString().split('T')[0];
            } else if (groupBy === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = date.getFullYear().toString();
            }

            const existing = grouped.get(key) || { count: 0, amountPaise: 0 };
            grouped.set(key, {
                count: existing.count + 1,
                amountPaise: existing.amountPaise + payment.amountPaise,
            });
        });

        return Array.from(grouped.entries())
            .map(([period, data]) => ({
                period,
                count: data.count,
                amountPaise: data.amountPaise,
                amountRupees: data.amountPaise / 100,
            }))
            .sort((a, b) => a.period.localeCompare(b.period));
    }
}
