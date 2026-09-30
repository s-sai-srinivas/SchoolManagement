import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const school = await prisma.school.findFirst({
        where: { name: 'Demo School' },
    });

    if (school) {
        console.log('SCHOOL_ID:', school.id);
    } else {
        console.log('No school found');
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
