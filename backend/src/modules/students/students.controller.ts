import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get('count')
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    count() {
        return this.studentsService.count();
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    findAll(@Query() queryStudentsDto: QueryStudentsDto, @CurrentUser() user: any) {
        // Parents can only see their own children — force the filter server-side
        if (user?.role === UserRole.PARENT) {
            queryStudentsDto.parentId = user.id;
            delete queryStudentsDto.schoolId;
            delete queryStudentsDto.search;
        }
        return this.studentsService.findAll(queryStudentsDto);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.studentsService.findOne(id, user);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.studentsService.softDelete(id);
    }
}
