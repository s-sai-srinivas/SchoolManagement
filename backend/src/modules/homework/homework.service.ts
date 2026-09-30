import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class HomeworkService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    async create(
        createHomeworkDto: CreateHomeworkDto,
        teacherId: string,
        schoolId: string,
        imageUrl?: string,
    ) {
        const homework = await this.prisma.homework.create({
            data: {
                ...createHomeworkDto,
                postedBy: teacherId,
                schoolId,
                imageUrl: imageUrl || null,
            },
            select: {
                id: true,
                class: true,
                section: true,
                subject: true,
                description: true,
                imageUrl: true,
                postedBy: true,
                createdAt: true,
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Notify all parents in the class
        try {
            const students = await this.prisma.student.findMany({
                where: {
                    class: createHomeworkDto.class,
                    section: createHomeworkDto.section,
                    schoolId,
                    deletedAt: null,
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
                },
            });

            const parentIds = [
                ...new Set(
                    students.flatMap((s) => s.parents.map((p) => p.parent.id)),
                ),
            ];

            if (parentIds.length > 0) {
                await this.notificationsService.createBulkNotifications(
                    parentIds.map((parentId) => ({
                        userId: parentId,
                        type: NotificationType.HOMEWORK_POSTED,
                        title: 'New Homework Posted',
                        message: `${createHomeworkDto.subject} homework posted for Class ${createHomeworkDto.class} ${createHomeworkDto.section}`,
                        metadata: {
                            homeworkId: homework.id,
                            class: createHomeworkDto.class,
                            section: createHomeworkDto.section,
                            subject: createHomeworkDto.subject,
                        },
                    })),
                );
            }
        } catch (error) {
            // Log error but don't fail homework creation
            console.error('Failed to send homework notifications:', error);
        }

        return homework;
    }

    async findByClass(classname: string, section: string, schoolId: string) {
        const homework = await this.prisma.homework.findMany({
            where: {
                class: classname,
                section,
                schoolId,
                deletedAt: null,
            },
            select: {
                id: true,
                class: true,
                section: true,
                subject: true,
                description: true,
                imageUrl: true,
                createdAt: true,
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return homework;
    }

    async findByStudent(studentId: string, parentId: string) {
        // First, verify parent owns student
        const studentParent = await this.prisma.studentParent.findFirst({
            where: {
                studentId,
                parentId,
            },
        });

        if (!studentParent) {
            throw new ForbiddenException(
                'Not authorized to view this student\'s homework',
            );
        }

        // Get student details
        const student = await this.prisma.student.findFirst({
            where: {
                id: studentId,
                deletedAt: null,
            },
            select: {
                class: true,
                section: true,
                schoolId: true,
            },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Get homework for student's class
        return this.findByClass(student.class, student.section, student.schoolId);
    }

    async remove(id: string, teacherId: string) {
        // Check if homework exists and belongs to teacher
        const homework = await this.prisma.homework.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!homework) {
            throw new NotFoundException('Homework not found');
        }

        if (homework.postedBy !== teacherId) {
            throw new ForbiddenException(
                'You can only delete your own homework',
            );
        }

        // Soft delete
        await this.prisma.homework.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Homework deleted successfully' };
    }
}
