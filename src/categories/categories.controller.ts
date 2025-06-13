import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe, 
  Logger, 
  UnauthorizedException, // Import UnauthorizedException for access control
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; // Add ApiBearerAuth
import { AtGuard } from '../auth/guards/at.guard'; // Correct relative path
import { RolesGuard } from '../auth/guards/roles.guard'; // Correct relative path
import { GetCurrentUserId, GetCurrentUser } from '../auth/decorators/index'; // Correct relative path
import { Role } from '../auth/enums/role.enum'; // Correct relative path
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth() // Indicates that authentication is required with a bearer token
@Controller('categories')
@UseGuards(AtGuard, RolesGuard)
@ApiTags('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name); // Initialize logger

  constructor(private readonly categoryService: CategoriesService) {}

  /**
   * Creates a new category for the authenticated user.
   * Both ADMIN and regular USER roles are allowed to create categories.
   */
  @Post()
  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Create a new category for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: Category })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCategory(
    @GetCurrentUserId() userId: number, // Get the ID of the authenticated user
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    this.logger.log(`User ${userId} attempting to create a new category.`);
    // Pass userId to the service to associate the category with the creator
    return this.categoryService.createCategory(userId, createCategoryDto);
  }

  /**
   * Retrieves categories based on the user's role.
   * ADMINs can see all categories. Regular USERS can only see their own categories.
   */
  @Get()
  @Roles(Role.ADMIN, Role.USER) // Allow both ADMIN and USER roles to access this endpoint
  @UseGuards(AtGuard, RolesGuard) // Ensure the user is authenticated and has the correct role
  @ApiOperation({ summary: 'Get all categories for current user / all for admin' })
  @ApiResponse({ status: 200, description: 'Returns categories based on user role', type: [Category] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllCategories(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role,
  ): Promise<Category[]> {
    this.logger.log(`Fetching categories for user ${userId} with role ${role}.`);
    if (role === Role.ADMIN) {
      return this.categoryService.findAllCategories(); // Service method to get all categories
    }
    return this.categoryService.findAllByUser(userId); // Service method to get categories by user ID
  }

  /**
   * Retrieves a specific category by its ID.
   * A user can only view their own category unless they are an ADMIN.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Returns category if authorized', type: Category })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findCategoryById(
    @Param('id', ParseIntPipe) id: number, // Ensure ID is parsed as an integer
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role,
  ): Promise<Category | undefined> {
    this.logger.log(`User ${userId} attempting to fetch category with ID: ${id}.`);
    const category = await this.categoryService.findCategoryById(id);

    // If category not found, the service should handle it, but adding a check here for clarity
    if (!category) {
      this.logger.warn(`Category with ID ${id} not found.`);
      // Depending on your service's findOne implementation, you might throw NotFoundException here.
      // For now, returning undefined will be handled by NestJS returning 204 or 404.
      return undefined;
    }

    // Authorization check: If not an admin AND the category does not belong to the user
    if (role !== Role.ADMIN && category.userId !== userId) { // Assuming Category entity has a 'userId' field
      this.logger.warn(`Unauthorized access attempt: User ${userId} tried to access category ${id} (owner: ${category.userId}).`);
      throw new UnauthorizedException('You can only view your own categories.');
    }

    return category;
  }

  /**
   * Updates a specific category by its ID.
   * Only the category owner or an ADMIN can update it.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: Category })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role,
  ): Promise<Category> {
    this.logger.log(`User ${userId} attempting to update category with ID: ${id}.`);
    // Pass userId and admin status to the service for authorization within the service logic
    return this.categoryService.updateCategory(id, userId, updateCategoryDto, role === Role.ADMIN);
  }

  /**
   * Deletes a specific category by its ID.
   * Only the category owner or an ADMIN can delete it.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('role') role: Role,
  ): Promise<void> {
    this.logger.log(`User ${userId} attempting to delete category with ID: ${id}.`);
    // Pass userId and admin status to the service for authorization within the service logic
    return this.categoryService.deleteCategory(id, userId, role === Role.ADMIN);
  }
}