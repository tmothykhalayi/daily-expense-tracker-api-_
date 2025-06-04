import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity'; 

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
   async createUser(@Body() createUserDto: CreateUserDto) {
    const { name, email, password , role } = createUserDto;
    return this.userService.createUser({ name, email, password ,role }); // 
  }

  //get all users
  @Get()
  async findAllUsers() {
    if (!this.userService) {
      throw new Error('UserService is not initialized');
    }
    return  this.userService.findAllUsers();
  }

  @Get(':id')
   async findUserById(@Param('id') id: string) { 
    return this.userService.findUserById(+id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
     return  this.userService.deleteUser(+id);
  }
}


