import { Controller, Get, ParseIntPipe, Query, UseGuards, Post, Body, Param, Delete, Put, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, Roles, GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { UserRole } from './entities/user.entity';

import { AtGuard, RolesGuard } from '../auth/guards';

@Controller('users')
@UseGuards(AtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    return this.userService.createUser({ name, email, password, role });
  }

  // Admins see all users, regular users see only users (not admins)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get()
  async findAllUsers(@GetCurrentUser() user) {
    return this.userService.findAllUsers(user.role);
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('me')
  async getMe(@GetCurrentUserId() userId: number) {
    return this.userService.findUserById(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get(':id')
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser() user
  ) {
    if (user.role !== UserRole.ADMIN && id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.userService.findUserById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser() user
  ) {
    if (user.role !== UserRole.ADMIN && id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  // Delete user by id - only ADMIN
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(+id);
  }
}
