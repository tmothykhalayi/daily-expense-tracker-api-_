import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      category_name: dto.name,  // assuming dto.name exists
    });
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ category_id: id });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findCategoryById(id);
    if (dto.name) {
      category.category_name = dto.name;
    }
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id); // simpler form
    if (result.affected === 0) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  }
}
