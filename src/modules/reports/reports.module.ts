import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution, Expense])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
