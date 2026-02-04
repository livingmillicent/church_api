import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facilitator } from './entities/facilitator.entity';
import { CreateFacilitatorDto } from './dto/create-facilitator.dto';
import { UpdateFacilitatorDto } from './dto/update-facilitator.dto';
import { MinistryType } from '../../common/enums';

@Injectable()
export class FacilitatorsService {
  constructor(
    @InjectRepository(Facilitator)
    private facilitatorRepository: Repository<Facilitator>,
  ) {}

  async create(createFacilitatorDto: CreateFacilitatorDto) {
    const facilitator = this.facilitatorRepository.create(createFacilitatorDto);
    return this.facilitatorRepository.save(facilitator);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.facilitatorRepository.findAndCount({
      skip,
      take: limit,
      order: { name: 'ASC' },
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
    const facilitator = await this.facilitatorRepository.findOne({ where: { id } });
    if (!facilitator) {
      throw new NotFoundException('Facilitator not found');
    }
    return facilitator;
  }

  async findByMinistry(ministryType: MinistryType, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.facilitatorRepository.findAndCount({
      where: { ministryType },
      skip,
      take: limit,
      order: { name: 'ASC' },
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

  async update(id: string, updateFacilitatorDto: UpdateFacilitatorDto) {
    const facilitator = await this.findOne(id);
    Object.assign(facilitator, updateFacilitatorDto);
    return this.facilitatorRepository.save(facilitator);
  }

  async remove(id: string) {
    const facilitator = await this.findOne(id);
    await this.facilitatorRepository.remove(facilitator);
    return { message: 'Facilitator deleted successfully' };
  }
}
