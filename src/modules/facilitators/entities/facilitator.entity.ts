import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FacilitatorRole, MinistryType } from '../../../common/enums';

@Entity('facilitators')
export class Facilitator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: FacilitatorRole,
  })
  role: FacilitatorRole;

  @Column({
    type: 'enum',
    enum: MinistryType,
  })
  ministryType: MinistryType;

  @Column()
  phone: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
