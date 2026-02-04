import { PartialType } from '@nestjs/swagger';
import { CreateFacilitatorDto } from './create-facilitator.dto';

export class UpdateFacilitatorDto extends PartialType(CreateFacilitatorDto) {}
