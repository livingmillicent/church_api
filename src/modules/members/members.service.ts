import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    const existing = await this.memberRepository.findOne({
      where: { email: createMemberDto.email },
    });

    if (existing) {
      throw new ConflictException('Member with this email already exists');
    }

    const member = this.memberRepository.create(createMemberDto);
    return this.memberRepository.save(member);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.memberRepository.findAndCount({
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
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async findByDepartment(departmentId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.memberRepository.findAndCount({
      where: { departmentId },
      skip,
      take: limit,
      order: { firstName: 'ASC' },
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

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const member = await this.findOne(id);
    Object.assign(member, updateMemberDto);
    return this.memberRepository.save(member);
  }

  async remove(id: string) {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member);
    return { message: 'Member deleted successfully' };
  }
}
