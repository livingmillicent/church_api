import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignLeaderDto } from './dto/assign-leader.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existing = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Department already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.departmentRepository.findAndCount({
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
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async assignLeader(id: string, assignLeaderDto: AssignLeaderDto) {
    const department = await this.findOne(id);
    department.leaderId = assignLeaderDto.leaderId;
    return this.departmentRepository.save(department);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
    return { message: 'Department deleted successfully' };
  }

  async seedDepartments() {
    const departments = [
      { name: 'Choir', description: 'Handles worship and praise sessions' },
      { name: 'Ushers', description: 'Welcomes and directs members during services' },
      { name: 'Protocol', description: 'Manages order and coordination of church events' },
      { name: 'Media', description: 'Handles audio-visual and technical equipment' },
      { name: 'Evangelism', description: 'Focuses on outreach and soul winning' },
      { name: 'Prayer', description: 'Leads and coordinates prayer meetings' },
      { name: 'Financial Team', description: 'Manages church finances and accounting' },
      { name: 'Planning', description: 'Plans and organizes church activities and events' },
      { name: 'Drama', description: 'Performs dramatic presentations and skits' },
      { name: 'Choreography', description: 'Coordinates dance and movement presentations' },
    ];

    const created = [];
    for (const dept of departments) {
      const existing = await this.departmentRepository.findOne({ where: { name: dept.name } });
      if (!existing) {
        const department = this.departmentRepository.create(dept);
        created.push(await this.departmentRepository.save(department));
      }
    }

    return {
      message: `Seeded ${created.length} departments`,
      departments: created,
    };
  }
}
