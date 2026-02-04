import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Gender, MinistryType, UserStatus } from '../../../common/enums';
import { Department } from '../../departments/entities/department.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column()
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, (department) => department.members, { eager: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({
    type: 'enum',
    enum: MinistryType,
    default: MinistryType.ADULT,
  })
  ministry: MinistryType;

  @Column({ type: 'date', nullable: true })
  joinDate: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
