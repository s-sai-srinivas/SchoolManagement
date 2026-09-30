import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    /**
     * POST /api/attendance/mark
     * Mark single student attendance
     * Access: TEACHER, ADMIN
     */
    @Post('mark')
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async markAttendance(
        @Body() dto: MarkAttendanceDto,
        @CurrentUser() user: any,
    ) {
        return this.attendanceService.markAttendance(
            dto,
            user.id,
            user.schoolId,
            user.role,
        );
    }

    /**
     * POST /api/attendance/bulk
     * Bulk mark attendance for entire class
     * Access: TEACHER, ADMIN
     */
    @Post('bulk')
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async bulkMarkAttendance(
        @Body() dto: BulkMarkAttendanceDto,
        @CurrentUser() user: any,
    ) {
        return this.attendanceService.bulkMarkAttendance(
            dto,
            user.id,
            user.schoolId,
            user.role,
        );
    }

    /**
     * GET /api/attendance/student/:studentId
     * Get student attendance history
     * Access: ADMIN, TEACHER (if in class), PARENT (if their child)
     */
    @Get('student/:studentId')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    async getStudentAttendance(
        @Param('studentId') studentId: string,
        @Query() queryDto: QueryAttendanceDto,
        @CurrentUser() user: any,
    ) {
        return this.attendanceService.getStudentAttendance(
            studentId,
            queryDto,
            user.id,
            user.role,
        );
    }

    /**
     * GET /api/attendance/class/:class/:section
     * Get class attendance for a specific date
     * Access: ADMIN, TEACHER (if assigned)
     */
    @Get('class/:class/:section')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    async getClassAttendance(
        @Param('class') classname: string,
        @Param('section') section: string,
        @CurrentUser() user: any,
        @Query('date') date: string,
    ) {
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
        return this.attendanceService.getClassAttendance(
            classname,
            section,
            date,
            user.id,
            user.schoolId,
            user.role,
        );
    }

    /**
     * PATCH /api/attendance/:id
     * Update attendance record
     * Access: TEACHER, ADMIN
     */
    @Patch(':id')
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    async updateAttendance(
        @Param('id') id: string,
        @Body() dto: UpdateAttendanceDto,
        @CurrentUser() user: any,
    ) {
        return this.attendanceService.updateAttendance(
            id,
            dto,
            user.id,
            user.role,
        );
    }

    /**
     * GET /api/attendance/report/daily
     * Get daily attendance report
     * Access: ADMIN
     */
    @Get('report/daily')
    @Roles(UserRole.ADMIN)
    async getDailyReport(
        @CurrentUser() user: any,
        @Query('date') date?: string,
    ) {
        const reportDate = date || new Date().toISOString().split('T')[0];
        return this.attendanceService.getDailyReport(user.schoolId, reportDate);
    }

    /**
     * GET /api/attendance/report/monthly
     * Get monthly attendance report
     * Access: ADMIN
     */
    @Get('report/monthly')
    @Roles(UserRole.ADMIN)
    async getMonthlyReport(
        @CurrentUser() user: any,
        @Query('month') month?: string,
    ) {
        if (!month) {
            const now = new Date();
            month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        return this.attendanceService.getMonthlyReport(user.schoolId, month);
    }

    /**
     * GET /api/attendance/report/defaulters
     * Get defaulters list (attendance < threshold)
     * Access: ADMIN
     */
    @Get('report/defaulters')
    @Roles(UserRole.ADMIN)
    async getDefaulters(
        @CurrentUser() user: any,
        @Query('threshold') threshold?: string,
    ) {
        const thresholdNum = threshold ? parseInt(threshold, 10) : 75;
        return this.attendanceService.getDefaulters(user.schoolId, thresholdNum);
    }
}

