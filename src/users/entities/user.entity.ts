import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { Report } from '../../reports/entities/report.entity';
import { Budget } from '../../budget/entities/budget.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) 
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text', nullable: true, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'text', nullable: true, select: false, default: null })
  hashedRefreshToken: string | null;

  @OneToMany(() => Report, report => report.user)
  reports: Report[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

  @OneToMany(() => Expense, expense => expense.user)
  expenses: Expense[];

  @OneToMany(() => Budget, budget => budget.user)
  budgets: Budget[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static isPasswordHashed(password: string): boolean {
    return /^\$2[aby]?\$\d{2}\$/.test(password);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !User.isPasswordHashed(this.password)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async setRefreshToken(refreshToken: string) {
    if (refreshToken) {
      this.hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    } else {
      this.hashedRefreshToken = null;
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!this.hashedRefreshToken) return false;
    return bcrypt.compare(refreshToken, this.hashedRefreshToken);
  }
}
