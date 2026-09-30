import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStatus, UserRole, NotificationType } from '@prisma/client';

@Injectable()
export class AttendanceService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Normalize date to midnight UTC (DATE type)
     */
    private normalizeDate(dateString: string): Date {
        const date = new Date(dateString);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Get date range from month string (YYYY-MM)
     */
    private getDateRange(month: string): { startDate: Date; endDate: Date } {
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
        const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
        return { startDate, endDate };
    }

    /**
     * Check if attendance can be edited
     */
    canEditAttendance(date: Date, userRole: UserRole): boolean {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const attendanceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Same day: can edit until 11:59 PM
        if (attendanceDate.getTime() === today.getTime()) {
            return true;
        }

        // Past dates: can edit if within 7 days OR user is ADMIN
        if (attendanceDate < today) {
            const daysDiff = Math.floor((today.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7 || userRole === UserRole.ADMIN;
        }

        // Future dates: not allowed
        return false;
    }

    /**
     * Validate teacher has access to class/section
     */
    private async validateTeacherAccess(
        teacherId: string,
        classname: string,
        section: string,
        schoolId: string,
    ): Promise<void> {
        const assignment = await this.prisma.teacherAssignment.findFirst({
            where: {
                teacherId,
                class: classname,
                section,
                schoolId,
            },
        });

        if (!assignment) {
            throw new ForbiddenException(
                'You are not assigned to this class/section',
            );
        }
    }

    /**
     * Mark single student attendance
     */
    async markAttendance(
        dto: MarkAttendanceDto,
        teacherId: string,
        schoolId: string,
        userRole: UserRole,
    ) {
        // Validate student exists
        const student = await this.prisma.student.findFirst({
            where: {
                id: dto.studentId,
                schoolId,
                deletedAt: null,
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Validate teacher access (unless admin)
        if (userRole !== UserRole.ADMIN) {
            await this.validateTeacherAccess(
                teacherId,
                student.class,
                student.section,
                schoolId,
            );
        }

        // Normalize date
        const attendanceDate = this.normalizeDate(dto.date);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Validate date (not future)
        if (attendanceDate > today) {
            throw new BadRequestException('Cannot mark attendance for future dates');
        }

        // Check if can edit
        if (!this.canEditAttendance(attendanceDate, userRole)) {
            throw new BadRequestException(
                'Attendance for this date can no longer be edited',
            );
        }

        // Upsert attendance (create or update)
        const attendance = await this.prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId: dto.studentId,
                    date: attendanceDate,
                },
            },
            update: {
                status: dto.status,
                markedBy: teacherId,
            },
            create: {
                studentId: dto.studentId,
                date: attendanceDate,
                status: dto.status,
                markedBy: teacherId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Create notifications for absent students
        if (dto.status === AttendanceStatus.ABSENT) {
            try {
                const studentWithParents = await this.prisma.student.findUnique({
                    where: { id: dto.studentId },
                    include: {
                        parents: {
                            include: {
                                parent: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                if (studentWithParents && studentWithParents.parents.length > 0) {
                    const parentIds = studentWithParents.parents.map((p) => p.parent.id);
                    const schoolName = studentWithParents.school.name;
                    const dateStr = dto.date;

                    await this.notificationsService.createBulkNotifications(
                        parentIds.map((parentId) => ({
                            userId: parentId,
                            type: NotificationType.ATTENDANCE_ABSENT,
                            title: 'Student Absent',
                            message: `Dear Parent, ${studentWithParents.name} was absent on ${dateStr}. -${schoolName}`,
                            metadata: {
                                studentId: dto.studentId,
                                studentName: studentWithParents.name,
                                date: dto.date,
                                status: AttendanceStatus.ABSENT,
                            },
                        })),
                    );
                }
            } catch (error) {
                // Log error but don't fail attendance marking
                console.error('Failed to send absence notifications:', error);
            }
        }

        return attendance;
    }

    /**
     * Bulk mark attendance for entire class
     */
    async bulkMarkAttendance(
        dto: BulkMarkAttendanceDto,
        teacherId: string,
        schoolId: string,
        userRole: UserRole,
    ) {
        // Validate teacher access (unless admin)
        if (userRole !== UserRole.ADMIN) {
            await this.validateTeacherAccess(
                teacherId,
                dto.class,
                dto.section,
                schoolId,
            );
        }

        // Normalize date
        const attendanceDate = this.normalizeDate(dto.date);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Validate date (not future)
        if (attendanceDate > today) {
            throw new BadRequestException('Cannot mark attendance for future dates');
        }

        // Check if can edit
        if (!this.canEditAttendance(attendanceDate, userRole)) {
            throw new BadRequestException(
                'Attendance for this date can no longer be edited',
            );
        }

        // Get all students in class/section
        const students = await this.prisma.student.findMany({
            where: {
                class: dto.class,
                section: dto.section,
                schoolId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
        });

        const studentIds = new Set(students.map((s) => s.id));

        // Validate all records belong to this class
        const invalidStudents = dto.records.filter(
            (r) => !studentIds.has(r.studentId),
        );
        if (invalidStudents.length > 0) {
            throw new BadRequestException(
                `Some students do not belong to Class ${dto.class} Section ${dto.section}`,
            );
        }

        // Process in transaction
        const results = await this.prisma.$transaction(async (tx) => {
            const marked: any[] = [];
            const errors: any[] = [];

            for (const record of dto.records) {
                try {
                    const attendance = await tx.attendance.upsert({
                        where: {
                            studentId_date: {
                                studentId: record.studentId,
                                date: attendanceDate,
                            },
                        },
                        update: {
                            status: record.status,
                            markedBy: teacherId,
                        },
                        create: {
                            studentId: record.studentId,
                            date: attendanceDate,
                            status: record.status,
                            markedBy: teacherId,
                        },
                    });
                    marked.push(attendance);
                } catch (error) {
                    errors.push({
                        studentId: record.studentId,
                        error: error.message,
                    });
                }
            }

            return { marked, errors };
        });

        // Create notifications for absent students
        const absentStudentIds = dto.records
            .filter((r) => r.status === AttendanceStatus.ABSENT)
            .map((r) => r.studentId);

        if (absentStudentIds.length > 0) {
            try {
                const absentStudents = await this.prisma.student.findMany({
                    where: {
                        id: { in: absentStudentIds },
                    },
                    include: {
                        parents: {
                            include: {
                                parent: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                const notifications: any[] = [];
                for (const student of absentStudents) {
                    const parentIds = student.parents.map((p) => p.parent.id);
                    const schoolName = student.school.name;
                    const dateStr = dto.date;

                    for (const parentId of parentIds) {
                        notifications.push({
                            userId: parentId,
                            type: NotificationType.ATTENDANCE_ABSENT,
                            title: 'Student Absent',
                            message: `Dear Parent, ${student.name} was absent on ${dateStr}. -${schoolName}`,
                            metadata: {
                                studentId: student.id,
                                studentName: student.name,
                                date: dto.date,
                                status: AttendanceStatus.ABSENT,
                            },
                        });
                    }
                }

                if (notifications.length > 0) {
                    await this.notificationsService.createBulkNotifications(
                        notifications,
                    );
                }
            } catch (error) {
                console.error('Failed to send absence notifications:', error);
            }
        }

        return {
            marked: results.marked.length,
            absentNotifications: absentStudentIds.length,
            errors: results.errors,
        };
    }

    /**
     * Get student attendance history
     */
    async getStudentAttendance(
        studentId: string,
        queryDto: QueryAttendanceDto,
        requesterId: string,
        requesterRole: UserRole,
    ) {
        // Validate student exists
        const student = await this.prisma.student.findFirst({
            where: {
                id: studentId,
                deletedAt: null,
            },
            include: {
                parents: {
                    select: {
                        parentId: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Validate access
        if (requesterRole === UserRole.PARENT) {
            const hasAccess = student.parents.some(
                (p) => p.parentId === requesterId,
            );
            if (!hasAccess) {
                throw new ForbiddenException(
                    'Not authorized to view this student\'s attendance',
                );
            }
        } else if (requesterRole === UserRole.TEACHER) {
            // Check if teacher is assigned to student's class
            const assignment = await this.prisma.teacherAssignment.findFirst({
                where: {
                    teacherId: requesterId,
                    class: student.class,
                    section: student.section,
                    schoolId: student.schoolId,
                },
            });
            if (!assignment) {
                throw new ForbiddenException(
                    'Not authorized to view this student\'s attendance',
                );
            }
        }
        // ADMIN has full access

        // Calculate date range
        let startDate: Date;
        let endDate: Date = new Date();
        endDate.setUTCHours(23, 59, 59, 999);

        if (queryDto.month) {
            const range = this.getDateRange(queryDto.month);
            startDate = range.startDate;
            endDate = range.endDate;
        } else if (queryDto.startDate && queryDto.endDate) {
            startDate = this.normalizeDate(queryDto.startDate);
            endDate = this.normalizeDate(queryDto.endDate);
            endDate.setUTCHours(23, 59, 59, 999);
        } else {
            // Default: last 30 days
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            startDate.setUTCHours(0, 0, 0, 0);
        }

        // Get attendance records
        const attendance = await this.prisma.attendance.findMany({
            where: {
                studentId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Calculate statistics
        const totalDays = attendance.length;
        const present = attendance.filter(
            (a) => a.status === AttendanceStatus.PRESENT,
        ).length;
        const absent = attendance.filter(
            (a) => a.status === AttendanceStatus.ABSENT,
        ).length;
        const late = attendance.filter(
            (a) => a.status === AttendanceStatus.LATE,
        ).length;
        const leave = attendance.filter(
            (a) => a.status === AttendanceStatus.LEAVE,
        ).length;

        // Percentage: (PRESENT + LATE) / total * 100
        const percentage =
            totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

        return {
            attendance: attendance.map((a) => ({
                id: a.id,
                date: a.date,
                status: a.status,
                markedBy: a.teacher.name,
                createdAt: a.createdAt,
            })),
            summary: {
                totalDays,
                present,
                absent,
                late,
                leave,
                percentage: Math.round(percentage * 100) / 100,
            },
        };
    }

    /**
     * Get class attendance for a specific date
     */
    async getClassAttendance(
        classname: string,
        section: string,
        date: string,
        teacherId: string,
        schoolId: string,
        userRole: UserRole,
    ) {
        // Validate teacher access (unless admin)
        if (userRole !== UserRole.ADMIN) {
            await this.validateTeacherAccess(
                teacherId,
                classname,
                section,
                schoolId,
            );
        }

        const attendanceDate = this.normalizeDate(date);

        // Get all students in class/section
        const students = await this.prisma.student.findMany({
            where: {
                class: classname,
                section,
                schoolId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                admissionNo: true,
            },
            orderBy: {
                admissionNo: 'asc',
            },
        });

        // Get attendance records for date
        const attendanceRecords = await this.prisma.attendance.findMany({
            where: {
                studentId: { in: students.map((s) => s.id) },
                date: attendanceDate,
            },
            select: {
                studentId: true,
                status: true,
            },
        });

        // Create map for quick lookup
        const attendanceMap = new Map(
            attendanceRecords.map((a) => [a.studentId, a.status]),
        );

        return {
            date,
            class: classname,
            section,
            students: students.map((student) => ({
                studentId: student.id,
                name: student.name,
                admissionNo: student.admissionNo,
                status: attendanceMap.get(student.id) || null,
            })),
        };
    }

    /**
     * Calculate attendance percentage for a student
     */
    async calculateAttendancePercentage(
        studentId: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<number> {
        // Get student to check join date
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            select: { createdAt: true },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Use student join date if later than startDate
        const actualStartDate = startDate && startDate > student.createdAt
            ? startDate
            : student.createdAt;

        const actualEndDate = endDate || new Date();

        // Get all attendance records
        const attendance = await this.prisma.attendance.findMany({
            where: {
                studentId,
                date: {
                    gte: actualStartDate,
                    lte: actualEndDate,
                },
            },
        });

        if (attendance.length === 0) {
            return 0;
        }

        // Count PRESENT and LATE as present
        const presentCount = attendance.filter(
            (a) =>
                a.status === AttendanceStatus.PRESENT ||
                a.status === AttendanceStatus.LATE,
        ).length;

        return (presentCount / attendance.length) * 100;
    }

    /**
     * Get defaulters (students with attendance < threshold)
     */
    async getDefaulters(schoolId: string, threshold: number = 75) {
        // Get all active students
        const students = await this.prisma.student.findMany({
            where: {
                schoolId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                admissionNo: true,
                class: true,
                section: true,
                createdAt: true,
            },
        });

        const defaulters: any[] = [];

        for (const student of students) {
            const percentage = await this.calculateAttendancePercentage(
                student.id,
            );

            if (percentage < threshold) {
                defaulters.push({
                    ...student,
                    attendancePercentage: Math.round(percentage * 100) / 100,
                });
            }
        }

        // Sort by percentage ascending
        defaulters.sort((a, b) => a.attendancePercentage - b.attendancePercentage);

        return {
            defaulters,
            threshold,
            count: defaulters.length,
        };
    }

    /**
     * Get daily attendance report
     */
    async getDailyReport(schoolId: string, date: string) {
        const attendanceDate = this.normalizeDate(date);

        // Get all attendance for date
        const attendance = await this.prisma.attendance.findMany({
            where: {
                date: attendanceDate,
                student: {
                    schoolId,
                    deletedAt: null,
                },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                    },
                },
            },
        });

        // Group by class/section
        const classMap = new Map<string, any>();

        for (const record of attendance) {
            const key = `${record.student.class}-${record.student.section}`;
            if (!classMap.has(key)) {
                classMap.set(key, {
                    class: record.student.class,
                    section: record.student.section,
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    leave: 0,
                    students: [],
                });
            }

            const classData = classMap.get(key);
            classData.total++;
            classData[record.status.toLowerCase()]++;
            classData.students.push({
                studentId: record.student.id,
                name: record.student.name,
                admissionNo: record.student.admissionNo,
                status: record.status,
            });
        }

        const summary = Array.from(classMap.values());

        return {
            date,
            summary,
            totalStudents: attendance.length,
        };
    }

    /**
     * Get monthly attendance report
     */
    async getMonthlyReport(schoolId: string, month: string) {
        const { startDate, endDate } = this.getDateRange(month);

        // Get all students
        const students = await this.prisma.student.findMany({
            where: {
                schoolId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                admissionNo: true,
                class: true,
                section: true,
                createdAt: true,
            },
        });

        const report: any[] = [];

        for (const student of students) {
            // Get attendance for month
            const attendance = await this.prisma.attendance.findMany({
                where: {
                    studentId: student.id,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            const totalDays = attendance.length;
            const present = attendance.filter(
                (a) => a.status === AttendanceStatus.PRESENT,
            ).length;
            const absent = attendance.filter(
                (a) => a.status === AttendanceStatus.ABSENT,
            ).length;
            const late = attendance.filter(
                (a) => a.status === AttendanceStatus.LATE,
            ).length;
            const leave = attendance.filter(
                (a) => a.status === AttendanceStatus.LEAVE,
            ).length;

            const percentage =
                totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

            report.push({
                studentId: student.id,
                name: student.name,
                admissionNo: student.admissionNo,
                class: student.class,
                section: student.section,
                totalDays,
                present,
                absent,
                late,
                leave,
                percentage: Math.round(percentage * 100) / 100,
            });
        }

        return {
            month,
            students: report,
            totalStudents: report.length,
        };
    }

    /**
     * Update attendance record
     */
    async updateAttendance(
        id: string,
        dto: UpdateAttendanceDto,
        teacherId: string,
        userRole: UserRole,
    ) {
        // Get attendance record
        const attendance = await this.prisma.attendance.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        class: true,
                        section: true,
                        schoolId: true,
                    },
                },
            },
        });

        if (!attendance) {
            throw new NotFoundException('Attendance record not found');
        }

        // Validate teacher access (unless admin)
        if (userRole !== UserRole.ADMIN) {
            await this.validateTeacherAccess(
                teacherId,
                attendance.student.class,
                attendance.student.section,
                attendance.student.schoolId,
            );
        }

        // Check if can edit
        if (!this.canEditAttendance(attendance.date, userRole)) {
            throw new BadRequestException(
                'Attendance for this date can no longer be edited',
            );
        }

        // Update attendance
        const updated = await this.prisma.attendance.update({
            where: { id },
            data: {
                status: dto.status,
                markedBy: teacherId,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        admissionNo: true,
                        class: true,
                        section: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Create notifications if changed to ABSENT
        if (dto.status === AttendanceStatus.ABSENT && attendance.status !== AttendanceStatus.ABSENT) {
            try {
                const studentWithParents = await this.prisma.student.findUnique({
                    where: { id: attendance.studentId },
                    include: {
                        parents: {
                            include: {
                                parent: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                if (studentWithParents && studentWithParents.parents.length > 0) {
                    const parentIds = studentWithParents.parents.map((p) => p.parent.id);
                    const schoolName = studentWithParents.school.name;
                    const dateStr = attendance.date.toISOString().split('T')[0];

                    await this.notificationsService.createBulkNotifications(
                        parentIds.map((parentId) => ({
                            userId: parentId,
                            type: NotificationType.ATTENDANCE_ABSENT,
                            title: 'Student Absent',
                            message: `Dear Parent, ${studentWithParents.name} was absent on ${dateStr}. -${schoolName}`,
                            metadata: {
                                studentId: attendance.studentId,
                                studentName: studentWithParents.name,
                                date: dateStr,
                                status: AttendanceStatus.ABSENT,
                            },
                        })),
                    );
                }
            } catch (error) {
                console.error('Failed to send absence notifications:', error);
            }
        }

        return updated;
    }
}



