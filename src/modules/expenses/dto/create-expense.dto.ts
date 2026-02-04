import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Sound System Maintenance' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Repair and maintenance of church sound system' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 1500.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Equipment' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 'Media' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: 'uuid-of-approver', required: false })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiProperty({ example: '2026-02-04T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  expenseDate: Date;
}
