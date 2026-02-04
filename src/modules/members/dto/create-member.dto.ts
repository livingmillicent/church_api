import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, MinistryType, UserStatus } from '../../../common/enums';

export class CreateMemberDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '1990-01-01' })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({ example: '+233201234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'uuid-of-department', required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ enum: MinistryType, example: MinistryType.ADULT })
  @IsOptional()
  @IsEnum(MinistryType)
  ministry?: MinistryType;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString()
  joinDate?: Date;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
