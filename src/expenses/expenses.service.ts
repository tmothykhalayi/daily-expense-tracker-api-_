import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createExpense(userId: number, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const category = await this.categoryRepository.findOneBy({ id: createExpenseDto.categoryId });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const expense = this.expensesRepository.create({
      userId,
      categoryId: category.id,
      amount: createExpenseDto.amount,
      date: createExpenseDto.date,
      description: createExpenseDto.description
    });
    
    return this.expensesRepository.save(expense);
  }

  async findAll(userId: number): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { userId },
      relations: ['category'],
      order: { created_at: 'DESC' }
    });
  }

  async findAllByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate)
      },
      relations: ['category'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number, userId: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id, userId },
      relations: ['category']
    });
    
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    
    return expense;
  }

  async update(id: number, userId: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id, userId);
    
    if (expense.userId !== userId) {
      throw new UnauthorizedException('You can only update your own expenses');
    }
    
    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async delete(id: number, userId: number, isAdmin: boolean): Promise<void> {
    const expense = await this.findOne(id, userId);
    
    if (!isAdmin && expense.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own expenses');
    }
    
    await this.expensesRepository.remove(expense);
  }
}
