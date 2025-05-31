import { Injectable ,NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

export interface Expense {
  expense_id: number;
  user_id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ExpensesService {
  private expenses: Expense[] = [];
  private idCounter = 1;

  //creating a new expense
  async createExpense(expense: {
    user_id: number;
    amount: number;
    category: string;
    date: string;
    description: string;
  }): Promise<Expense> {
    const newExpense: Expense = {
      expense_id: this.idCounter++,
      user_id: expense.user_id,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.expenses.push(newExpense);
    return newExpense;
  }

  //find all expenses
  async findAll(): Promise<Expense[]> {
    return this.expenses;
  }
//FIND ONE EXPENSE BY ID
  async findOne(id: number): Promise<Expense> {
    const expense = this.expenses.find((e) => e.expense_id === id);
    if (!expense) {
      throw new NotFoundException(`Expense not found with id: ${id}`);
    }
    return expense;
  }
  //update the existing expenses

  async update(
    id: number,
    expenseUpdates: {
      user_id?: number;
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
    },
  ): Promise<Expense> {
    const expense = await this.findOne(id);

    if (expenseUpdates.user_id !== undefined)
      expense.user_id = expenseUpdates.user_id;
    if (expenseUpdates.amount !== undefined)
      expense.amount = expenseUpdates.amount;
    if (expenseUpdates.category !== undefined)
      expense.category = expenseUpdates.category;
    if (expenseUpdates.date !== undefined) expense.date = expenseUpdates.date;
    if (expenseUpdates.description !== undefined)
      expense.description = expenseUpdates.description;

    expense.updated_at = new Date();

    return expense;
  }

  //deleting a  new expense from db

  async delete(id: number): Promise<Expense> {
    const index = this.expenses.findIndex((e) => e.expense_id === id);
    if (index === -1) {
      throw new NotFoundException(`Expense not found with id: ${id}`);
    }
    const [deletedExpense] = this.expenses.splice(index, 1);
    return deletedExpense;
  }
}
