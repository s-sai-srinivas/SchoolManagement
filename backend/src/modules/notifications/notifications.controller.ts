import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    findAll(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
        return this.notificationsService.findAll(user.id, paginationDto);
    }

    @Patch(':id/read')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
        return this.notificationsService.markAsRead(id, user.id);
    }

    @Patch('read-all')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    markAllAsRead(@CurrentUser() user: any) {
        return this.notificationsService.markAllAsRead(user.id);
    }

    @Get('unread-count')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    getUnreadCount(@CurrentUser() user: any) {
        return this.notificationsService.getUnreadCount(user.id);
    }
}
