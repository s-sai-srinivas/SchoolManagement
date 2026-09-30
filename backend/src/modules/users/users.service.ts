import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generatePassword } from '../../common/utils/password-generator.util';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createTeacher(createTeacherDto: CreateTeacherDto) {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createTeacherDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Generate password
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 12);

        const teacher = await this.prisma.user.create({
            data: {
                email: createTeacherDto.email,
                name: createTeacherDto.name,
                password: hashedPassword,
                role: UserRole.TEACHER,
                schoolId: createTeacherDto.schoolId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                createdAt: true,
            },
        });

        return {
            ...teacher,
            temporaryPassword: password, // Return for email sending (Phase 3.5)
        };
    }

    async createParent(createParentDto: CreateParentDto) {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createParentDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Generate password
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 12);

        const parent = await this.prisma.user.create({
            data: {
                email: createParentDto.email,
                name: createParentDto.name,
                password: hashedPassword,
                role: UserRole.PARENT,
                schoolId: createParentDto.schoolId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                createdAt: true,
            },
        });

        return {
            ...parent,
            temporaryPassword: password, // Return for email sending (Phase 3.5)
        };
    }

    async findAll(queryUsersDto: QueryUsersDto) {
        const { role, schoolId, search } = queryUsersDto;

        const users = await this.prisma.user.findMany({
            where: {
                deletedAt: null,
                ...(role && { role }),
                ...(schoolId && { schoolId }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return users;
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                schoolId: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        // Check if user exists
        await this.findOne(id);

        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async softDelete(id: string) {
        // Check if user exists
        await this.findOne(id);

        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'User deleted successfully' };
    }
}
