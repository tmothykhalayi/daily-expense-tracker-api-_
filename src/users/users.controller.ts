import { 
  Controller, Get, ParseIntPipe, UseGuards, Post, 
  Body, Param, Delete, Put, ForbiddenException, 
  Logger, UnauthorizedException 
} from '@nestjs/common';
import { Role } from '../auth/enums/role.enum'; 
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, Roles, GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { UserRole } from './entities/user.entity';
import { 
  ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, 
  ApiParam, ApiBody 
} from '@nestjs/swagger';
import { AtGuard, RolesGuard } from '../auth/guards';

@Controller('users')
@ApiBearerAuth()
@ApiTags('users')
@UseGuards(AtGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userService: UsersService) {}

  @Public()
// @Roles(Role.ADMIN) 
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        role: UserRole.USER
      }
    }
  })

  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating new user: ${createUserDto.email}`);
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN) 
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async findAllUsers(@GetCurrentUser() user) {
    this.logger.log(`Admin ${user.email} requesting all users list`);
    return this.userService.findAllUsers(user.role);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user profile',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        role: UserRole.USER
      }
    }
  })
  async getMe(@GetCurrentUserId() userId: number) {
    this.logger.log(`Fetching profile for user ${userId}`);
    return this.userService.findUserById(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin or own profile)' })
  @ApiParam({ name: 'id', type: 'number' })
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser() user
  ) {
    this.logger.log(`User ${user.email} requesting profile ${id}`);
    
    if (user.role !== UserRole.ADMIN && id !== userId) {
      this.logger.warn(`Unauthorized access attempt to profile ${id} by ${user.email}`);
      throw new ForbiddenException('You can only view your own profile');
    }
    
    return this.userService.findUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (Admin or own profile)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser() user
  ) {
    this.logger.log(`Update request for user ${id} by ${user.email}`);
    
    if (user.role !== UserRole.ADMIN && id !== userId) {
      this.logger.warn(`Unauthorized update attempt for user ${id} by ${user.email}`);
      throw new ForbiddenException('You can only update your own profile');
    }

  
    if (updateUserDto.role && user.role !== UserRole.ADMIN) {
      this.logger.warn(`Role modification attempt by non-admin user ${user.email}`);
      throw new UnauthorizedException('Only administrators can modify user roles');
    }
    
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) 
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', type: 'number' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number, 
    @GetCurrentUser() user
  ) {
    this.logger.log(`Admin ${user.email} deleting user ${id}`);
    
    if (id === user.id) {
      this.logger.warn(`Admin ${user.email} attempted to delete their own account`);
      throw new ForbiddenException('Administrators cannot delete their own account');
    }
    
    return this.userService.deleteUser(id);
  }
}
