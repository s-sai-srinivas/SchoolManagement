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
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    findAll(@Query() queryStudentsDto: QueryStudentsDto) {
        return this.studentsService.findAll(queryStudentsDto);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(id);
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
