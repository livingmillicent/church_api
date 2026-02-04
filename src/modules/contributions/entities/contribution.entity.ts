import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContributionType, PaymentMethod } from '../../../common/enums';
import { User } from '../../auth/entities/user.entity';

@Entity('contributions')
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  memberId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'memberId' })
  member: User;

  @Column({
    type: 'enum',
    enum: ContributionType,
  })
  contributionType: ContributionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
