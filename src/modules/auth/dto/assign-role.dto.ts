import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class AssignRoleDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: UserRole, example: UserRole.LEADER })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
