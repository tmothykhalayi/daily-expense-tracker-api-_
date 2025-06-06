import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Create user with password hashing
  async createUser(user: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = this.usersRepository.create({
      name: user.name,
      email: user.email,
      password: hashedPassword, // Store hashed password
      role: (user.role as UserRole) || UserRole.USER,
      hashedRefreshToken: 'null',
    });
    

    // Save the user
    const savedUser = await this.usersRepository.save(newUser);

    // Fetch the complete user with password
    const completeUser = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      select: ['id', 'name', 'email', 'password', 'role', 'hashedRefreshToken'],
    });

    if (!completeUser) {
      throw new Error('Failed to create user');
    }

    // Remove password from response
    const { password, ...result } = completeUser;
    return result as User;
  }

  // Find all users (excluding password)
  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'createdAt',
        'updatedAt',
        'hashedRefreshToken',
      ], 
    });
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'hashedRefreshToken'], 
    });

    if (!user) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }
    return user;
  }

  // Find user by ID
  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return user;
  }

  // Update user with password hashing
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    user.updatedAt = new Date();
    await this.usersRepository.save(user);

    //  return the password in the response
    const { password, ...result } = user;
    return result as User;
  }

  //  update method
  async update(id: number, updateFields: Partial<User>): Promise<User> {
    const user = await this.findUserById(id);
    Object.assign(user, updateFields);
    user.updatedAt = new Date();
    await this.usersRepository.save(user);
    return user;
  }

  // Save refresh token (hashed)
  async saveRefreshToken(userId: number, refreshToken: string): Promise<User> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return this.update(userId, { hashedRefreshToken });
  }

  // Delete user
  async deleteUser(id: number): Promise<User> {
    const user = await this.findUserById(id);
    await this.usersRepository.remove(user);
    return user;
  }
}
