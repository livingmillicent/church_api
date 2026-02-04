import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitatorsService } from './facilitators.service';
import { FacilitatorsController } from './facilitators.controller';
import { Facilitator } from './entities/facilitator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facilitator])],
  controllers: [FacilitatorsController],
  providers: [FacilitatorsService],
  exports: [FacilitatorsService],
})
export class FacilitatorsModule {}
