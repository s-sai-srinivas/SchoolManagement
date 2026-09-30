import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
}

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, paginationDto: PaginationDto) {
        const { skip = 0, take = 20 } = paginationDto;

        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                select: {
                    id: true,
                    type: true,
                    title: true,
                    message: true,
                    isRead: true,
                    metadata: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take,
            }),
            this.prisma.notification.count({
                where: { userId },
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

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return { message: 'Notification marked as read' };
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        return { message: 'All notifications marked as read' };
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });

        return { count };
    }

    async createNotification(data: CreateNotificationDto) {
        return await this.prisma.notification.create({
            data,
        });
    }

    async createBulkNotifications(notifications: CreateNotificationDto[]) {
        if (notifications.length === 0) {
            return { count: 0 };
        }

        const result = await this.prisma.notification.createMany({
            data: notifications,
            skipDuplicates: true,
        });

        return result;
    }
}
