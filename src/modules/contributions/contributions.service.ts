import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Contribution } from './entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { FilterContributionDto } from './dto/filter-contribution.dto';
import { ContributionType } from '../../common/enums';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private contributionRepository: Repository<Contribution>,
  ) {}

  async create(createContributionDto: CreateContributionDto, userId: string) {
    const contribution = this.contributionRepository.create({
      ...createContributionDto,
      createdBy: userId,
    });

    return this.contributionRepository.save(contribution);
  }

  async findAll(page: number = 1, limit: number = 10, filter?: FilterContributionDto) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filter?.type) {
      where.contributionType = filter.type;
    }

    if (filter?.memberId) {
      where.memberId = filter.memberId;
    }

    if (filter?.startDate && filter?.endDate) {
      where.date = Between(filter.startDate, filter.endDate);
    }

    const [data, total] = await this.contributionRepository.findAndCount({
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
    const contribution = await this.contributionRepository.findOne({ where: { id } });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return contribution;
  }

  async findByType(type: ContributionType, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.contributionRepository.findAndCount({
      where: { contributionType: type },
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

  async findByMember(memberId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.contributionRepository.findAndCount({
      where: { memberId },
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

  async monthlySummary(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const contributions = await this.contributionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });

    const summary = contributions.reduce((acc, contribution) => {
      const type = contribution.contributionType;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(contribution.amount);
      return acc;
    }, {});

    const total = Object.values(summary).reduce((sum: number, val: number) => sum + val, 0);

    return {
      year,
      month,
      summary,
      total,
      count: contributions.length,
    };
  }

  async yearlySummary(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const contributions = await this.contributionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });

    const summary = contributions.reduce((acc, contribution) => {
      const type = contribution.contributionType;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(contribution.amount);
      return acc;
    }, {});

    const total = Object.values(summary).reduce((sum: number, val: number) => sum + val, 0);

    return {
      year,
      summary,
      total,
      count: contributions.length,
    };
  }

  async totalByType() {
    const result = await this.contributionRepository
      .createQueryBuilder('contribution')
      .select('contribution.contributionType', 'type')
      .addSelect('SUM(contribution.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .groupBy('contribution.contributionType')
      .getRawMany();

    return result.map((item) => ({
      type: item.type,
      total: parseFloat(item.total),
      count: parseInt(item.count),
    }));
  }

  async update(id: string, updateContributionDto: UpdateContributionDto) {
    const contribution = await this.findOne(id);
    Object.assign(contribution, updateContributionDto);
    return this.contributionRepository.save(contribution);
  }

  async remove(id: string) {
    const contribution = await this.findOne(id);
    await this.contributionRepository.remove(contribution);
    return { message: 'Contribution deleted successfully' };
  }
}
