import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NoticesService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    async create(
        createNoticeDto: CreateNoticeDto,
        adminId: string,
        schoolId: string,
    ) {
        const notice = await this.prisma.notice.create({
            data: {
                ...createNoticeDto,
                postedBy: adminId,
                schoolId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                postedBy: true,
                schoolId: true,
                createdAt: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Notify all users in the school
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    schoolId,
                    deletedAt: null,
                },
                select: {
                    id: true,
                },
            });

            if (users.length > 0) {
                await this.notificationsService.createBulkNotifications(
                    users.map((user) => ({
                        userId: user.id,
                        type: NotificationType.NOTICE_POSTED,
                        title: 'New Notice',
                        message: notice.title,
                        metadata: {
                            noticeId: notice.id,
                        },
                    })),
                );
            }
        } catch (error) {
            // Log error but don't fail notice creation
            console.error('Failed to send notice notifications:', error);
        }

        return notice;
    }

    async findAll(schoolId: string, paginationDto: PaginationDto) {
        const { skip = 0, take = 10 } = paginationDto;

        const [data, total] = await Promise.all([
            this.prisma.notice.findMany({
                where: {
                    schoolId,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                    admin: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take,
            }),
            this.prisma.notice.count({
                where: {
                    schoolId,
                    deletedAt: null,
                },
            }),
        ]);

        return {
            data,
            total,
            skip,
            take,
            hasMore: skip + take < total,
        };
    }

    async findOne(id: string, schoolId: string) {
        const notice = await this.prisma.notice.findFirst({
            where: {
                id,
                schoolId,
                deletedAt: null,
            },
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!notice) {
            throw new NotFoundException('Notice not found');
        }

        return notice;
    }

    async remove(id: string, schoolId: string) {
        // Check if notice exists
        const notice = await this.prisma.notice.findFirst({
            where: {
                id,
                schoolId,
                deletedAt: null,
            },
        });

        if (!notice) {
            throw new NotFoundException('Notice not found');
        }

        // Soft delete
        await this.prisma.notice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Notice deleted successfully' };
    }
}
