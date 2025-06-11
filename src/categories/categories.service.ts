import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async createCategory(userId: number, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      name: dto.name,
      userId: userId,
    });
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async updateCategory(
    id: number,
    userId: number,
    dto: UpdateCategoryDto,
    isAdmin: boolean,
  ): Promise<Category> {
    const category = await this.findCategoryById(id);

    if (!isAdmin && category.userId !== userId) {
      throw new UnauthorizedException('You can only update your own categories.');
    }

    if (dto.name) {
      category.name = dto.name;
    }

    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: number, userId?: number, isAdmin = false): Promise<void> {
    const category = await this.findCategoryById(id);

    if (!isAdmin && category.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own categories.');
    }

    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  }

  async findAllByUser(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        userId,
      },
    });
  }
}
