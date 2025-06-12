import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Expense } from "../../expenses/entities/expense.entity";
import { ReportTimeRange } from "../dto/get-report.dto";

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) 
  userId: number;

  // Enum column, matching your "type" column as enum
  @Column({
    type: 'enum',
    enum: ReportTimeRange,
    default: ReportTimeRange.DAILY
  })
  type: ReportTimeRange;

  // Dates for start and end date
  @Column('date')
  start_date: string;

  @Column('date')
  end_date: string;

  // Decimal total amount with precision 10, scale 2
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_amount: number;

  // Automatically set generated timestamp
  @CreateDateColumn()
  generated_at: Date;

  // Many reports belong to one user, join on userId column
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // One report can have many expenses
  @OneToMany(() => Expense, expense => expense.report)
  expenses: Expense[];
}
