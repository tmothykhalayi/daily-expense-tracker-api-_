
import { Injectable ,NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface Category {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}


@Injectable()
export class CategoriesService {
    private categories: Category[] = [];
  private idCounter = 1;

  createCategory(dto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: this.idCounter++,
      name: dto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  
  // Finding all categories
  findAllCategories(): Category[] {
    return this.categories;
  }


    // Finding a category by id
  findCategoryById(id: number): Category {
    const category = this.categories.find((cat) => cat.id === id);
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return category;
  }


  updateCategory(id: number, dto: UpdateCategoryDto): Category {
    const category = this.findCategoryById(id);

    if (dto.name) {
      category.name = dto.name;
    }

    category.updatedAt = new Date();
    return category;
  }


    // Deleting a category by id
  deleteCategory(id: number): void {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) throw new NotFoundException(`Category with id ${id} not found`);
    this.categories.splice(index, 1);
  }
}


  