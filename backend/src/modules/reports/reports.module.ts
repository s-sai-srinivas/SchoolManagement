import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [PrismaModule, AttendanceModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule { }
