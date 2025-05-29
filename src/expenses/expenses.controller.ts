import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpensesService, Expense } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto'


@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
  //post in the expenses controller to create a new expense
  @Post()
  async create(@Body() body: any): Promise<Expense> {
    return this.expensesService.createExpense(body);
  }
  //used  to fetch all expenses
  @Get()
  async findAll(): Promise<Expense[]> {
    return this.expensesService.findAll();
  }
  //used to fetch by id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Expense> {
    return this.expensesService.findOne(+id);
  }
  //used to update an expense by id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any): Promise<Expense> {
    return this.expensesService.update(+id, body);
  }
  //used to delete an expense by id
  @Delete(':id')
  delete(@Param('id') id: string): any {
    return this.expensesService.delete(+id);
  }
}
