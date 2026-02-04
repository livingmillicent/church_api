import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { MembersModule } from './modules/members/members.module';
import { FacilitatorsModule } from './modules/facilitators/facilitators.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    ContributionsModule,
    ExpensesModule,
    DepartmentsModule,
    MembersModule,
    FacilitatorsModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
