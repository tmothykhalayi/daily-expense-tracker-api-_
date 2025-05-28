import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// ✅ Interface for User — define user structure
export interface User {
  id: number;
  name: string;
  email: string;
  password: string | number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  // ✅ Create user
  async createUser(user: {
    name: string;
    email: string;
    password: string | number;
    role:string;
  }): Promise<User> {
    const newUser: User = {
      id: this.idCounter++,
      name: user.name,
      email: user.email,
      password: user.password,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  // ✅ Find all users
  async findAllUsers(): Promise<User[]> {
    return this.users;
  }

  // ✅ Find user by email
  async findUserByEmail(email: string): Promise<User> {
    const user = this.users.find((u) => u.email === email);
    if (!user) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }
    return user;
  }

  // ✅ Find user by ID
  async findUserById(id: number): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return user;
  }

  // ✅ Update user
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.password !== undefined)
      user.password = updateUserDto.password;

    user.updatedAt = new Date();
    return user;
  }

  // ✅ Delete user
  async deleteUser(id: number): Promise<User> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    const [deletedUser] = this.users.splice(index, 1);
    return deletedUser;
  }
}


