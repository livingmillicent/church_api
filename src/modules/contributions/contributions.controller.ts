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
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { FilterContributionDto } from './dto/filter-contribution.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { UserRole, ContributionType } from '../../common/enums';

@ApiTags('Contributions')
@Controller('contributions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Create new contribution' })
  @ApiResponse({ status: 201, description: 'Contribution created successfully' })
  async create(@Body() createContributionDto: CreateContributionDto, @GetUser() user: User) {
    return this.contributionsService.create(createContributionDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get all contributions with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query() filter?: FilterContributionDto,
  ) {
    return this.contributionsService.findAll(page, limit, filter);
  }

  @Get('by-type/:type')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get contributions by type' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByType(
    @Param('type') type: ContributionType,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.contributionsService.findByType(type, page, limit);
  }

  @Get('by-member/:memberId')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get contributions by member' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByMember(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.contributionsService.findByMember(memberId, page, limit);
  }

  @Get('summary/monthly/:year/:month')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get monthly contribution summary' })
  async monthlySummary(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.contributionsService.monthlySummary(year, month);
  }

  @Get('summary/yearly/:year')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get yearly contribution summary' })
  async yearlySummary(@Param('year', ParseIntPipe) year: number) {
    return this.contributionsService.yearlySummary(year);
  }

  @Get('summary/by-type')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get total contributions grouped by type' })
  async totalByType() {
    return this.contributionsService.totalByType();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Get contribution by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contributionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Update contribution' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContributionDto: UpdateContributionDto,
  ) {
    return this.contributionsService.update(id, updateContributionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.TREASURER)
  @ApiOperation({ summary: 'Delete contribution' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contributionsService.remove(id);
  }
}
