import { Injectable, NotFoundException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async createExpense(userId: number, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    this.logger.log(`Creating expense for user ${userId}`);
    
    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      user: { id: userId },
    });
    
    return this.expensesRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    this.logger.log('Finding all expenses (admin access)');
    return this.expensesRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
  }

  async findAllByUser(userId: number): Promise<Expense[]> {
    this.logger.log(`Finding all expenses for user ${userId}`);
    return this.expensesRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Expense> {
    this.logger.log(`Finding expense with id: ${id}`);
    
    const expense = await this.expensesRepository.findOne({
      where: { expense_id: id },
      relations: ['user']
    });
    
    if (!expense) {
      this.logger.warn(`Expense not found with id: ${id}`);
      throw new NotFoundException(`Expense not found with id: ${id}`);
    }
    
    return expense;
  }

  async update(id: number, userId: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    this.logger.log(`Updating expense ${id} for user ${userId}`);
    
    const expense = await this.findOne(id);
    
    if (expense.user.id !== userId) {
      this.logger.warn(`User ${userId} attempted to update expense ${id} belonging to user ${expense.user.id}`);
      throw new UnauthorizedException('You can only update your own expenses');
    }
    
    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async delete(id: number, userId: number, isAdmin: boolean): Promise<void> {
    this.logger.log(`Deleting expense ${id} by user ${userId} (admin: ${isAdmin})`);
    
    const expense = await this.findOne(id);
    
    if (!isAdmin && expense.user.id !== userId) {
      this.logger.warn(`User ${userId} attempted to delete expense ${id} belonging to user ${expense.user.id}`);
      throw new UnauthorizedException('You can only delete your own expenses');
    }
    
    await this.expensesRepository.remove(expense);
  }
}
