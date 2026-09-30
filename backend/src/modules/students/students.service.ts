import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async create(createStudentDto: CreateStudentDto) {
        // Check if admission number already exists
        const existingStudent = await this.prisma.student.findUnique({
            where: { admissionNo: createStudentDto.admissionNo },
        });

        if (existingStudent) {
            throw new ConflictException('Admission number already exists');
        }

        const student = await this.prisma.student.create({
            data: createStudentDto,
            select: {
                id: true,
                admissionNo: true,
                name: true,
                class: true,
                section: true,
                schoolId: true,
                createdAt: true,
            },
        });

        return student;
    }

    async findAll(queryStudentsDto: QueryStudentsDto) {
        const { class: className, section, schoolId, search } = queryStudentsDto;

        const students = await this.prisma.student.findMany({
            where: {
                deletedAt: null,
                ...(className && { class: className }),
                ...(section && { section }),
                ...(schoolId && { schoolId }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { admissionNo: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            select: {
                id: true,
                admissionNo: true,
                name: true,
                class: true,
                section: true,
                schoolId: true,
                createdAt: true,
            },
            orderBy: {
                admissionNo: 'asc',
            },
        });

        return students;
    }

    async count() {
        const count = await this.prisma.student.count({
            where: {
                deletedAt: null,
            },
        });

        return { count };
    }

    async findOne(id: string) {
        const student = await this.prisma.student.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                admissionNo: true,
                name: true,
                class: true,
                section: true,
                schoolId: true,
                createdAt: true,
                updatedAt: true,
                parents: {
                    select: {
                        id: true,
                        relationType: true,
                        parent: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }

        return student;
    }

    async update(id: string, updateStudentDto: UpdateStudentDto) {
        // Check if student exists
        await this.findOne(id);

        // If updating admission number, check for conflicts
        if (updateStudentDto.admissionNo) {
            const existingStudent = await this.prisma.student.findFirst({
                where: {
                    admissionNo: updateStudentDto.admissionNo,
                    id: { not: id },
                },
            });

            if (existingStudent) {
                throw new ConflictException('Admission number already exists');
            }
        }

        const student = await this.prisma.student.update({
            where: { id },
            data: updateStudentDto,
            select: {
                id: true,
                admissionNo: true,
                name: true,
                class: true,
                section: true,
                updatedAt: true,
            },
        });

        return student;
    }

    async softDelete(id: string) {
        // Check if student exists
        await this.findOne(id);

        await this.prisma.student.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Student deleted successfully' };
    }
}
