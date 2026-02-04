import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContributionType } from '../../../common/enums';

export class FilterContributionDto {
  @ApiPropertyOptional({ enum: ContributionType })
  @IsOptional()
  @IsEnum(ContributionType)
  type?: ContributionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
