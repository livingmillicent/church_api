import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial-summary')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get financial summary report' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  async financialSummary(@Query('startDate') startDate?: Date, @Query('endDate') endDate?: Date) {
    return this.reportsService.financialSummary(startDate, endDate);
  }

  @Get('contributions-vs-expenses')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get contributions vs expenses report for a year' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async contributionsVsExpenses(@Query('year', ParseIntPipe) year: number) {
    return this.reportsService.contributionsVsExpenses(year);
  }

  @Get('monthly-giving')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get monthly giving report' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Monthly giving report retrieved successfully' })
  async monthlyGivingReport(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.monthlyGivingReport(year, month);
  }

  @Get('departmental-expenses')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get departmental expense report' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Departmental expense report retrieved successfully' })
  async departmentalExpenseReport(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.departmentalExpenseReport(startDate, endDate);
  }
}
