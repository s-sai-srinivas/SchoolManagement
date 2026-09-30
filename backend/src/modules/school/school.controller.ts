import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('schools')
export class SchoolController {
    constructor(private readonly schoolService: SchoolService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createSchoolDto: CreateSchoolDto) {
        return this.schoolService.create(createSchoolDto);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.schoolService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
        return this.schoolService.update(id, updateSchoolDto);
    }

    @Post(':id/logo')
    @Roles(UserRole.ADMIN)
    uploadLogo(@Param('id') id: string, @Body('logoUrl') logoUrl: string) {
        return this.schoolService.uploadLogo(id, logoUrl);
    }
}
