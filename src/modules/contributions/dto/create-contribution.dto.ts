import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContributionType, PaymentMethod } from '../../../common/enums';

export class CreateContributionDto {
  @ApiProperty({ example: 'uuid-of-member' })
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @ApiProperty({ enum: ContributionType, example: ContributionType.TITHES })
  @IsNotEmpty()
  @IsEnum(ContributionType)
  contributionType: ContributionType;

  @ApiProperty({ example: 500.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'REF123456', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: '2026-02-04T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
