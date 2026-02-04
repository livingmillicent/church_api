import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Contribution)
    private contributionRepository: Repository<Contribution>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async financialSummary(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }

    const contributions = await this.contributionRepository.find({ where });
    const totalContributions = contributions.reduce(
      (sum, contrib) => sum + Number(contrib.amount),
      0,
    );

    const expenseWhere: any = {};
    if (startDate && endDate) {
      expenseWhere.expenseDate = Between(startDate, endDate);
    }

    const expenses = await this.expenseRepository.find({ where: expenseWhere });
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    const balance = totalContributions - totalExpenses;

    return {
      period: {
        startDate,
        endDate,
      },
      contributions: {
        total: totalContributions,
        count: contributions.length,
      },
      expenses: {
        total: totalExpenses,
        count: expenses.length,
      },
      balance,
    };
  }

  async contributionsVsExpenses(year: number) {
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const contributions = await this.contributionRepository.find({
        where: {
          date: Between(startDate, endDate),
        },
      });

      const expenses = await this.expenseRepository.find({
        where: {
          expenseDate: Between(startDate, endDate),
        },
      });

      const totalContributions = contributions.reduce(
        (sum, contrib) => sum + Number(contrib.amount),
        0,
      );

      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

      monthlyData.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        contributions: totalContributions,
        expenses: totalExpenses,
        balance: totalContributions - totalExpenses,
      });
    }

    const yearlyTotals = monthlyData.reduce(
      (acc, month) => {
        acc.contributions += month.contributions;
        acc.expenses += month.expenses;
        acc.balance += month.balance;
        return acc;
      },
      { contributions: 0, expenses: 0, balance: 0 },
    );

    return {
      year,
      monthlyData,
      yearlyTotals,
    };
  }

  async monthlyGivingReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const contributions = await this.contributionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['member'],
    });

    const byType = contributions.reduce((acc, contrib) => {
      const type = contrib.contributionType;
      if (!acc[type]) {
        acc[type] = { total: 0, count: 0 };
      }
      acc[type].total += Number(contrib.amount);
      acc[type].count += 1;
      return acc;
    }, {});

    const byMember = contributions.reduce((acc, contrib) => {
      const memberName = `${contrib.member.firstName} ${contrib.member.lastName}`;
      if (!acc[memberName]) {
        acc[memberName] = { total: 0, count: 0 };
      }
      acc[memberName].total += Number(contrib.amount);
      acc[memberName].count += 1;
      return acc;
    }, {});

    const total = contributions.reduce((sum, contrib) => sum + Number(contrib.amount), 0);

    return {
      year,
      month,
      monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
      total,
      count: contributions.length,
      byType,
      topGivers: Object.entries(byMember)
        .map(([name, data]: [string, any]) => ({
          name,
          ...data,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10),
    };
  }

  async departmentalExpenseReport(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate && endDate) {
      where.expenseDate = Between(startDate, endDate);
    }

    const expenses = await this.expenseRepository.find({ where });

    const byDepartment = expenses.reduce((acc, expense) => {
      const dept = expense.department;
      if (!acc[dept]) {
        acc[dept] = { total: 0, count: 0, expenses: [] };
      }
      acc[dept].total += Number(expense.amount);
      acc[dept].count += 1;
      acc[dept].expenses.push({
        title: expense.title,
        amount: Number(expense.amount),
        date: expense.expenseDate,
      });
      return acc;
    }, {});

    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      period: {
        startDate,
        endDate,
      },
      total,
      count: expenses.length,
      byDepartment,
    };
  }
}
