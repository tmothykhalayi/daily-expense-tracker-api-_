import { Controller, Get ,ParseIntPipe,Query,UseGuards, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public,Roles, GetCurrentUser, GetCurrentUserId } from '../auth/decorators';
import { UserRole } from './entities/user.entity';


import { AtGuard, RolesGuard } from '../auth/guards';

@Controller('users')
@UseGuards(AtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}
 
  @Public()
  @Post()
   async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password , role } = createUserDto;
    return this.userService.createUser({ name, email, password ,role }); // 
  }

  //get all users
  @Roles(UserRole.ADMIN )
  @Get()
  async findAllUsers() {
    if (!this.userService) {
      throw new Error('UserService is not initialized');
    }
    return  this.userService.findAllUsers();
  }

  //get user by id
   @Roles(UserRole.ADMIN ,UserRole.USER)
  @Get(':id')
   async findUserById(@Param('id') id: string) { 
    return this.userService.findUserById(+id);
  }


  //put user by id

  @Roles(UserRole.ADMIN , UserRole.USER)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(+id, updateUserDto);
  }


  //delete user by id
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
     return  this.userService.deleteUser(+id);
  }
}