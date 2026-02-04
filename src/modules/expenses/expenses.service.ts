import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      createdBy: userId,
    });

    return this.expenseRepository.save(expense);
  }

  async findAll(page: number = 1, limit: number = 10, filter?: FilterExpenseDto) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filter?.department) {
      where.department = filter.department;
    }

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.startDate && filter?.endDate) {
      where.expenseDate = Between(filter.startDate, filter.endDate);
    }

    const [data, total] = await this.expenseRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async totalExpenses(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate && endDate) {
      where.expenseDate = Between(startDate, endDate);
    }

    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .getRawOne();

    return {
      total: parseFloat(result.total) || 0,
      count: parseInt(result.count) || 0,
      startDate,
      endDate,
    };
  }

  async expensesByDepartment() {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.department', 'department')
      .addSelect('SUM(expense.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .groupBy('expense.department')
      .getRawMany();

    return result.map((item) => ({
      department: item.department,
      total: parseFloat(item.total),
      count: parseInt(item.count),
    }));
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.findOne(id);
    Object.assign(expense, updateExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async remove(id: string) {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
    return { message: 'Expense deleted successfully' };
  }
}
