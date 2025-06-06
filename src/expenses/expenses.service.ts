import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async createExpense(data: {
    user_id: number;
    amount: number;
    category: string;
    date: string;
    description: string;
  }): Promise<Expense> {
    const expense = this.expensesRepository.create(data);
    return this.expensesRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find();
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOneBy({ expense_id: id });
    if (!expense) throw new NotFoundException(`Expense not found with id: ${id}`);
    return expense;
  }

  async update(
    id: number,
    updates: Partial<Omit<Expense, 'expense_id' | 'created_at' | 'updated_at'>>,
  ): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, updates);
    return this.expensesRepository.save(expense);
  }

  async delete(id: number): Promise<Expense> {
    const expense = await this.findOne(id);
    await this.expensesRepository.remove(expense);
    return expense;
  }
}
