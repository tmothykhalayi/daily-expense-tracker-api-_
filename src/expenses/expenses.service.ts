import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // Create expense - available to both users and admins
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

  // Admin methods
  async findAllExpenses(): Promise<Expense[]> {
    return this.expensesRepository.find({
      relations: ['user', 'category'],
      order: { created_at: 'DESC' }
    });
  }

  async findOneAsAdmin(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['user', 'category']
    });
    
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    
    return expense;
  }

  async updateAsAdmin(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOneAsAdmin(id);
    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async deleteAsAdmin(id: number): Promise<void> {
    const expense = await this.findOneAsAdmin(id);
    await this.expensesRepository.remove(expense);
  }

  // User methods
  async findUserExpenses(userId: number): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { userId },
      relations: ['category'],
      order: { created_at: 'DESC' }
    });
  }

  async findOneAsUser(id: number, userId: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['category']
    });
    
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('You can only access your own expenses');
    }
    
    return expense;
  }

  async updateAsUser(id: number, userId: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOneAsUser(id, userId);
    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async deleteAsUser(id: number, userId: number): Promise<void> {
    const expense = await this.findOneAsUser(id, userId);
    await this.expensesRepository.remove(expense);
  }
}
