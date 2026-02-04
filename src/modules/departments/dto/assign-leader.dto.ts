import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignLeaderDto {
  @ApiProperty({ example: 'uuid-of-leader' })
  @IsNotEmpty()
  @IsUUID()
  leaderId: string;
}
