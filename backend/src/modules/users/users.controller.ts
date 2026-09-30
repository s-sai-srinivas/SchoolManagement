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
import { UsersService } from './users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('teacher')
    @Roles(UserRole.ADMIN)
    createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
        return this.usersService.createTeacher(createTeacherDto);
    }

    @Post('parent')
    @Roles(UserRole.ADMIN)
    createParent(@Body() createParentDto: CreateParentDto) {
        return this.usersService.createParent(createParentDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Query() queryUsersDto: QueryUsersDto) {
        return this.usersService.findAll(queryUsersDto);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.softDelete(id);
    }
}
