import { IsNotEmpty, IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FacilitatorRole, MinistryType } from '../../../common/enums';

export class CreateFacilitatorDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: FacilitatorRole, example: FacilitatorRole.TEACHER })
  @IsNotEmpty()
  @IsEnum(FacilitatorRole)
  role: FacilitatorRole;

  @ApiProperty({ enum: MinistryType, example: MinistryType.CHILDREN })
  @IsNotEmpty()
  @IsEnum(MinistryType)
  ministryType: MinistryType;

  @ApiProperty({ example: '+233201234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'jane.smith@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
