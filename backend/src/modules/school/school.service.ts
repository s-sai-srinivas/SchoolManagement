import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
    constructor(private prisma: PrismaService) { }

    async create(createSchoolDto: CreateSchoolDto) {
        const school = await this.prisma.school.create({
            data: createSchoolDto,
        });

        return {
            id: school.id,
            name: school.name,
            logoUrl: school.logoUrl,
            createdAt: school.createdAt,
        };
    }

    async findOne(id: string) {
        const school = await this.prisma.school.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        users: true,
                        students: true,
                    },
                },
            },
        });

        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        return school;
    }

    async update(id: string, updateSchoolDto: UpdateSchoolDto) {
        // Check if school exists
        await this.findOne(id);

        const school = await this.prisma.school.update({
            where: { id },
            data: updateSchoolDto,
            select: {
                id: true,
                name: true,
                logoUrl: true,
                updatedAt: true,
            },
        });

        return school;
    }

    async uploadLogo(id: string, logoUrl: string) {
        // Check if school exists
        await this.findOne(id);

        const school = await this.prisma.school.update({
            where: { id },
            data: { logoUrl },
            select: {
                id: true,
                name: true,
                logoUrl: true,
            },
        });

        return school;
    }
}
