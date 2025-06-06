import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) {}

    //creating a new categories
  @Post()
    async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.createCategory(createCategoryDto);
    }

//finding all categories
   @Get()
    async findAllCategories(): Promise<Category[]> {
        return this.categoryService.findAllCategories();
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




    
    

    
   
    


