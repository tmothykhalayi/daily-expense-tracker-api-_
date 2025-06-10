import { 
  Controller, Get, Post, Body, Param, Delete, Put, 
  UseGuards, ParseIntPipe, Logger, UnauthorizedException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Public, GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Role } from '../auth/enums/role.enum';

@ApiBearerAuth()
@Controller('expenses')
@UseGuards(AtGuard, RolesGuard)
@ApiTags('expenses')
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async createExpense(
    @GetCurrentUserId() userId: number,
    @Body() createExpenseDto: CreateExpenseDto
  ) {
    this.logger.log(`Creating expense for user ${userId}`);
    return this.expensesService.createExpense(userId, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get expenses (filtered by user role)' })
  @ApiResponse({ status: 200, description: 'Returns expenses based on user role' })
  async getExpenses(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Fetching expenses for ${role} with ID ${userId}`);
    if (role === Role.ADMIN) {
      return this.expensesService.findAll();
    }
    return this.expensesService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Returns expense if authorized' })
  async getExpenseById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Fetching expense ${id} for user ${userId}`);
    const expense = await this.expensesService.findOne(id);
    
    if (role !== Role.ADMIN && expense.user.id !== userId) {
      this.logger.warn(`Unauthorized access attempt to expense ${id} by user ${userId}`);
      throw new UnauthorizedException('You can only view your own expenses');
    }
    
    return expense;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Updating expense ${id} by user ${userId}`);
    return this.expensesService.update(id, userId, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  async deleteExpense(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Deleting expense ${id} by user ${userId}`);
    return this.expensesService.delete(id, userId, role === Role.ADMIN);
  }
}
