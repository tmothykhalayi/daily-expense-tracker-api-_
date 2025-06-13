import { 
  Controller, Get, Post, Body, Param, Delete, Put, 
  UseGuards, ParseIntPipe, Logger 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { GetCurrentUserId, GetCurrentUser, Roles } from '../auth/decorators';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Role } from '../auth/enums/role.enum';

@Controller('expenses')
@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(AtGuard, RolesGuard)
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async createExpense(
    @GetCurrentUserId() userId: number,
    @Body() createExpenseDto: CreateExpenseDto
  ) {
    this.logger.log(`Creating expense for user ${userId}`);
    return this.expensesService.createExpense(userId, createExpenseDto);
  }

  // Admin-only: Get all expenses
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all expenses (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all expenses' })
  async findAllExpenses() {
    this.logger.log('Admin fetching all expenses');
    return this.expensesService.findAllExpenses();
  }

  // User (or admin) gets own expenses
  @Get('me')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get current user expenses' })
  @ApiResponse({ status: 200, description: 'Returns current user expenses' })
  async findUserExpenses(@GetCurrentUserId() userId: number) {
    this.logger.log(`Fetching expenses for user ${userId}`);
    return this.expensesService.findUserExpenses(userId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Returns expense if authorized' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Fetching expense ${id} for user ${userId}`);
    if (role === Role.ADMIN) {
      return this.expensesService.findOneAsAdmin(id);
    }
    return this.expensesService.findOneAsUser(id, userId);
  }

  @Put(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Updating expense ${id} by user ${userId}`);
    if (role === Role.ADMIN) {
      return this.expensesService.updateAsAdmin(id, updateExpenseDto);
    }
    return this.expensesService.updateAsUser(id, userId, updateExpenseDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  async deleteExpense(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role
  ) {
    this.logger.log(`Deleting expense ${id} by user ${userId}`);
    if (role === Role.ADMIN) {
      return this.expensesService.deleteAsAdmin(id);
    }
    return this.expensesService.deleteAsUser(id, userId);
  }
}
