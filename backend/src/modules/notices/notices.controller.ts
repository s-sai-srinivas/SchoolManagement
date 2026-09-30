import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    async create(@Body() createNoticeDto: CreateNoticeDto, @CurrentUser() user: any) {
        try {
            return await this.noticesService.create(
                createNoticeDto,
                user.id,
                user.schoolId,
            );
        } catch (error) {
            console.error('Error creating notice:', error);
            throw error;
        }
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    findAll(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
        return this.noticesService.findAll(user.schoolId, paginationDto);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.noticesService.findOne(id, user.schoolId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.noticesService.remove(id, user.schoolId);
    }
}
