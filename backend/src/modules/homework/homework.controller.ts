import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { multerConfig } from '../../config/multer.config';

@Controller('homework')
export class HomeworkController {
    constructor(private readonly homeworkService: HomeworkService) { }

    @Post()
    @Roles(UserRole.TEACHER)
    @UseInterceptors(FileInterceptor('image', {
        ...multerConfig,
        fileFilter: (req, file, cb) => {
            // Make file upload optional - accept if provided, skip if not
            if (!file) {
                return cb(null, true);
            }
            // Use original file filter if file is provided
            if (multerConfig.fileFilter) {
                return multerConfig.fileFilter(req, file, cb);
            }
            cb(null, true);
        },
    }))
    async create(
        @Body() createHomeworkDto: CreateHomeworkDto,
        @CurrentUser() user: any,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        try {
            const imageUrl = file ? `/uploads/homework/${file.filename}` : undefined;
            return await this.homeworkService.create(
                createHomeworkDto,
                user.id,
                user.schoolId,
                imageUrl,
            );
        } catch (error) {
            console.error('Error creating homework:', error);
            throw error;
        }
    }

    @Get('class/:class/:section')
    @Roles(UserRole.TEACHER, UserRole.ADMIN)
    findByClass(
        @Param('class') classname: string,
        @Param('section') section: string,
        @CurrentUser() user: any,
    ) {
        return this.homeworkService.findByClass(classname, section, user.schoolId);
    }

    @Get('student/:studentId')
    @Roles(UserRole.PARENT, UserRole.ADMIN)
    findByStudent(
        @Param('studentId') studentId: string,
        @CurrentUser() user: any,
    ) {
        // If admin, skip parent check (TODO: add admin bypass)
        if (user.role === UserRole.ADMIN) {
            // For admins, we need to get student's class first
            // For now, parents only
            return this.homeworkService.findByStudent(studentId, user.id);
        }
        return this.homeworkService.findByStudent(studentId, user.id);
    }

    @Delete(':id')
    @Roles(UserRole.TEACHER)
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.homeworkService.remove(id, user.id);
    }
}
