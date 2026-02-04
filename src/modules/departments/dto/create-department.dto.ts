import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Choir' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Handles worship and praise sessions' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'uuid-of-leader', required: false })
  @IsOptional()
  @IsUUID()
  leaderId?: string;
}
