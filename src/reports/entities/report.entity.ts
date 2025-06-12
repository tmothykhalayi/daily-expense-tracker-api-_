import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('date')
  start_date: string;

  @Column('date')
  end_date: string;

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  generated_at: Date;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'userId' })
  user: User;
}

