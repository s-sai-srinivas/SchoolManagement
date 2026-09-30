import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create Demo School
    let school = await prisma.school.findFirst({
        where: { name: 'Demo School' },
    });

    if (!school) {
        console.log('🏫 School not found, creating new one...');
        school = await prisma.school.create({
            data: {
                name: 'Demo School',
            },
        });
        console.log('🏫 Created Demo School:', school.id);
    } else {
        console.log('🏫 Using existing Demo School:', school.id);
    }

    // 2. Create Admin User
    const adminEmail = 'admin@demo.com';
    const adminPassword = 'admin123';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'System Admin',
                role: UserRole.ADMIN,
                schoolId: school.id,
            },
        });
        console.log('👤 Created Admin User:', adminEmail);
    } else {
        console.log('👤 Admin user already exists:', adminEmail);
    }

    // 3. Create Teacher User
    const teacherEmail = 'teacher@demo.com';
    const teacherPassword = 'teacher123';
    const existingTeacher = await prisma.user.findUnique({ where: { email: teacherEmail } });

    if (!existingTeacher) {
        const hashedPassword = await bcrypt.hash(teacherPassword, 12);
        await prisma.user.create({
            data: {
                email: teacherEmail,
                password: hashedPassword,
                name: 'Sarah Teacher',
                role: UserRole.TEACHER,
                schoolId: school.id,
            },
        });
        console.log('👤 Created Teacher User:', teacherEmail);
    } else {
        console.log('👤 Teacher user already exists:', teacherEmail);
    }

    // 4. Create Parent User
    const parentEmail = 'parent@demo.com';
    const parentPassword = 'parent123';
    const existingParent = await prisma.user.findUnique({ where: { email: parentEmail } });

    if (!existingParent) {
        const hashedPassword = await bcrypt.hash(parentPassword, 12);
        await prisma.user.create({
            data: {
                email: parentEmail,
                password: hashedPassword,
                name: 'John Parent',
                role: UserRole.PARENT,
                schoolId: school.id,
            },
        });
        console.log('👤 Created Parent User:', parentEmail);
    } else {
        console.log('👤 Parent user already exists:', parentEmail);
    }

    // 5. Create Student User
    const studentEmail = 'student@demo.com';
    const studentPassword = 'student123';
    const existingStudent = await prisma.user.findUnique({ where: { email: studentEmail } });

    if (!existingStudent) {
        const hashedPassword = await bcrypt.hash(studentPassword, 12);
        await prisma.user.create({
            data: {
                email: studentEmail,
                password: hashedPassword,
                name: 'Alex Student',
                role: UserRole.STUDENT,
                schoolId: school.id,
            },
        });
        console.log('👤 Created Student User:', studentEmail);
    } else {
        console.log('👤 Student user already exists:', studentEmail);
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
