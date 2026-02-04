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
import { FacilitatorsService } from './facilitators.service';
import { CreateFacilitatorDto } from './dto/create-facilitator.dto';
import { UpdateFacilitatorDto } from './dto/update-facilitator.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, MinistryType } from '../../common/enums';

@ApiTags('Facilitators (Children & Teens)')
@Controller('facilitators')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class FacilitatorsController {
  constructor(private readonly facilitatorsService: FacilitatorsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Create new facilitator' })
  @ApiResponse({ status: 201, description: 'Facilitator created successfully' })
  async create(@Body() createFacilitatorDto: CreateFacilitatorDto) {
    return this.facilitatorsService.create(createFacilitatorDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Get all facilitators with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.facilitatorsService.findAll(page, limit);
  }

  @Get('ministry/:ministryType')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Get facilitators by ministry type' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByMinistry(
    @Param('ministryType') ministryType: MinistryType,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.facilitatorsService.findByMinistry(ministryType, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Get facilitator by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facilitatorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR, UserRole.LEADER)
  @ApiOperation({ summary: 'Update facilitator' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFacilitatorDto: UpdateFacilitatorDto,
  ) {
    return this.facilitatorsService.update(id, updateFacilitatorDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PASTOR)
  @ApiOperation({ summary: 'Delete facilitator' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.facilitatorsService.remove(id);
  }
}
