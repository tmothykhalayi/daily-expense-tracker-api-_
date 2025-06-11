import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Expense } from "../../expenses/entities/expense.entity";
import { ReportTimeRange } from "../dto/get-report.dto";

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: ReportTimeRange,
    default: ReportTimeRange.DAILY
  })
  type: ReportTimeRange;

  @Column('date')
  start_date: string;

  @Column('date')
  end_date: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @CreateDateColumn()
  generated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Expense, expense => expense.report)
  expenses: Expense[];
}
