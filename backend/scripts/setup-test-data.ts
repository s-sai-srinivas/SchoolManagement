import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function ensureSchool() {
    let school = await prisma.school.findFirst({
        where: { name: 'Demo School' },
    });

    if (!school) {
        school = await prisma.school.create({
            data: {
                name: 'Demo School',
            },
        });
        console.log('🏫 Created Demo School:', school.id);
    } else {
        console.log('🏫 Using existing Demo School:', school.id);
    }

    return school;
}

async function ensureUser(
    email: string,
    password: string,
    role: UserRole,
    name: string,
    schoolId: string,
) {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 12);
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                schoolId,
            },
        });
        console.log(`👤 Created ${role} user: ${email}`);
    } else {
        console.log(`👤 Using existing ${role} user: ${email}`);
    }
    return user;
}

async function ensureTeacherAssignments(teacherId: string, schoolId: string) {
    const assignments = [
        { class: '10', section: 'A', subject: 'Mathematics' },
        { class: '10', section: 'B', subject: 'Science' },
    ];

    for (const assignment of assignments) {
        await prisma.teacherAssignment.upsert({
            where: {
                teacherId_class_section_subject: {
                    teacherId,
                    class: assignment.class,
                    section: assignment.section,
                    subject: assignment.subject,
                },
            },
            create: {
                teacherId,
                schoolId,
                class: assignment.class,
                section: assignment.section,
                subject: assignment.subject,
            },
            update: {},
        });
    }

    console.log('📚 Ensured teacher assignments.');
}

async function ensureStudents(
    schoolId: string,
    parentUserIds: string[],
) {
    const students = [
        {
            admissionNo: 'TEST001',
            name: 'Rahul Kumar',
            class: '10',
            section: 'A',
        },
        {
            admissionNo: 'TEST002',
            name: 'Priya Singh',
            class: '10',
            section: 'B',
        },
        {
            admissionNo: 'TEST003',
            name: 'Amit Sharma',
            class: '9',
            section: 'A',
        },
    ];

    for (const studentData of students) {
        const student = await prisma.student.upsert({
            where: {
                admissionNo: studentData.admissionNo,
            },
            create: {
                ...studentData,
                schoolId,
            },
            update: {
                ...studentData,
            },
        });

        for (const parentId of parentUserIds) {
            await prisma.studentParent.upsert({
                where: {
                    studentId_parentId: {
                        studentId: student.id,
                        parentId,
                    },
                },
                create: {
                    studentId: student.id,
                    parentId,
                },
                update: {},
            });
        }
    }

    console.log('🧒 Ensured students and parent relationships.');
}

async function ensureFeeStructure(schoolId: string) {
    const existingStructure = await prisma.feeStructure.findFirst({
        where: { schoolId },
    });

    if (!existingStructure) {
        await prisma.feeStructure.create({
            data: {
                schoolId,
                annualAmountPaise: 5000000, // ₹50,000
                installments: 4,
                installmentDates: ['2025-04-01', '2025-07-01', '2025-10-01', '2026-01-01'],
            },
        });
        console.log('💰 Created fee structure.');
    } else {
        console.log('💰 Fee structure already exists.');
    }
}

async function main() {
    console.log('🚀 Setting up test data...');

    const school = await ensureSchool();

    const admin = await ensureUser(
        'admin@demo.com',
        'admin123',
        UserRole.ADMIN,
        'System Admin',
        school.id,
    );

    const teacher = await ensureUser(
        'teacher@demo.com',
        'teacher123',
        UserRole.TEACHER,
        'Sarah Teacher',
        school.id,
    );

    const parent = await ensureUser(
        'parent@demo.com',
        'parent123',
        UserRole.PARENT,
        'John Parent',
        school.id,
    );

    const parent2 = await ensureUser(
        'parent2@demo.com',
        'parent123',
        UserRole.PARENT,
        'Jane Parent',
        school.id,
    );

    await ensureTeacherAssignments(teacher.id, school.id);

    await ensureStudents(school.id, [parent.id, parent2.id]);

    await ensureFeeStructure(school.id);

    console.log('✅ Test data setup complete.');
    console.log('Admin:', 'admin@demo.com / admin123');
    console.log('Teacher:', 'teacher@demo.com / teacher123');
    console.log('Parent:', 'parent@demo.com / parent123');
}

main()
    .catch((error) => {
        console.error('❌ Error setting up test data:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

