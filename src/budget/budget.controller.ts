import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put,  Param, Body, Delete, UseGuards , Logger, UnauthorizedException,ParseIntPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { UserRole } from '../users/entities/user.entity';
import { AtGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('budgets')
@ApiTags('budgets')
@ApiBearerAuth() // Indicates that authentication is required with a bearer token
@Controller('categories')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}


  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ 
    status: 201, 
    description: 'Budget has been successfully created.',
   // type: Budget 
  })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create(createBudgetDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all budgets for a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of budgets for the specified user.',
   // type: [Budget] 
  })
  findAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.budgetService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found budget.',
   // type: Budget 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({ 
    status: 200, 
    description: 'Budget has been successfully updated.',
   // type: Budget 
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ 
    status: 200, 
    description: 'Budget has been successfully deleted.' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.remove(id);
  }
}
