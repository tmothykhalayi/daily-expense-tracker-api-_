import { User } from '../../users/entities/user.entity';
import { Report } from '../../reports/entities/report.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 100 })
  category: string;

  @Column('date')
  date: Date;

  @Column('text', { nullable: true })
  description?: string;

  @ManyToOne(() => Report, (report) => report.expenses, { nullable: true })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column({ nullable: true })
  reportId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
