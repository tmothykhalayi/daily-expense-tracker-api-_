// expense.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Report } from '../../reports/entities/report.entity';

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    description: string;

    @Column('date')
    date: Date;

    @Column()
    userId: number;

    @Column()
    categoryId: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User, user => user.expenses)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @ManyToOne(() => Report)
    @JoinColumn({ name: 'reportId' })
    report: Report;
}
