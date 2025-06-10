import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetCurrentUserId, GetCurrentUser } from '../auth/decorators/index';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
@UseGuards(AtGuard, RolesGuard)
@ApiTags('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) {}

    //creating a new categories
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create category (Admin only)' })
    async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.createCategory(createCategoryDto);
    }

//finding all categories
   @Get()
   @ApiOperation({ summary: 'Get categories for current user or all for admin' })
    async findAllCategories(@GetCurrentUserId() userId: number, @GetCurrentUser('role') role: Role): Promise<Category[]> {
      if (role === Role.ADMIN) {
        return this.categoryService.findAllCategories();
      }
      return this.categoryService.findAllByUser(userId);
    }


    //finding a category by id
@Get(':id')
    async findCategoryById(@Param('id') id: number): Promise<Category | undefined> {
        return this.categoryService.findCategoryById(id);
    }


//updating a category by id
  @Put(':id')
    async updateCategory(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        return this.categoryService.updateCategory(id, updateCategoryDto);
    }

//deleting a category by id
  @Delete(':id')
    async deleteCategory(@Param('id') id: number): Promise<void> {
        return this.categoryService.deleteCategory(id);
    }
}












