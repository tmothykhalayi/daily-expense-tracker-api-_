import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('budgets')
export class Budget {
  @ApiProperty({
    description: 'The unique identifier of the budget',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID who owns this budget',
    example: 1,
  })
  @Column()
  userId: number;

  @ApiProperty({
    description: 'User who owns this budget',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiPropertyOptional({
    description: 'Category ID for this budget',
    example: 1,
  })
  @Column({ nullable: true })
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Category of this budget',
    type: () => Category,
  })
  @ManyToOne(
    () => Category,
    (category) => category.budgets,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @ApiProperty({
    description: 'Budget amount',
    example: 1000.0,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Budget start date',
    example: '2025-01-01',
  })
  @Column({ type: 'date' })
  startDate: string;

  @ApiProperty({
    description: 'Budget end date',
    example: '2025-12-31',
  })
  @Column({ type: 'date' })
  endDate: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-01T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateBudget() {
    if (this.amount <= 0) {
      throw new Error('Budget amount must be greater than 0');
    }
    this.validateDates();
  }

  private validateDates() {
    if (new Date(this.endDate) < new Date(this.startDate)) {
      throw new Error('End date cannot be before start date');
    }
  }
}
