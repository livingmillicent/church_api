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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignLeaderDto } from './dto/assign-leader.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Post('seed')
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @ApiOperation({ summary: 'Seed default departments' })
  @ApiResponse({ status: 201, description: 'Departments seeded successfully' })
  async seed() {
    return this.departmentsService.seedDepartments();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Get all departments with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.departmentsService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Get department by ID with members' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id/assign-leader')
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @ApiOperation({ summary: 'Assign leader to department' })
  async assignLeader(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignLeaderDto: AssignLeaderDto,
  ) {
    return this.departmentsService.assignLeader(id, assignLeaderDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @ApiOperation({ summary: 'Update department' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @ApiOperation({ summary: 'Delete department' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
