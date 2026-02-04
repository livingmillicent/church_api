import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../../common/enums';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Create new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async create(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: User) {
    return this.expensesService.create(createExpenseDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get all expenses with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query() filter?: FilterExpenseDto,
  ) {
    return this.expensesService.findAll(page, limit, filter);
  }

  @Get('total')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get total expenses' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async totalExpenses(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.expensesService.totalExpenses(startDate, endDate);
  }

  @Get('by-department')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get expenses grouped by department' })
  async expensesByDepartment() {
    return this.expensesService.expensesByDepartment();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get expense by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Update expense' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TREASURER)
  @ApiOperation({ summary: 'Delete expense' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.remove(id);
  }
}
