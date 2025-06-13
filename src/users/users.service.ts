// src/users/users.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service'; // ✅ Import mail service

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly mailService: MailService // ✅ Inject mail service
  ) {}

  // Create user with password hashing
  async createUser(user: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = this.usersRepository.create({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: (user.role as UserRole) || UserRole.USER,
      hashedRefreshToken: null,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // ✅ Send welcome email (can be in try/catch if you want to be safe)
    try {
      await this.mailService.sendWelcomeEmail(savedUser.email, savedUser.name);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
      // Optionally log or notify an error tracker
    }

    const { password, ...result } = savedUser;
    return Object.assign(Object.create(Object.getPrototypeOf(savedUser)), result);
  }

  async findAllUsers(requesterRole: UserRole): Promise<Omit<User, 'password'>[]> {
    if (requesterRole === UserRole.ADMIN) {
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
    } else {
      return this.usersRepository.find({
        where: { role: UserRole.USER },
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
  }

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

  async findUserById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
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
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    user.updatedAt = new Date();
    const updatedUser = await this.usersRepository.save(user);

    const { password, ...result } = updatedUser;
    return Object.assign(Object.create(Object.getPrototypeOf(updatedUser)), result);
  }

  async update(
    id: number,
    updateFields: Partial<User>,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    Object.assign(user, updateFields);
    user.updatedAt = new Date();
    const updatedUser = await this.usersRepository.save(user);

    const { password, ...result } = updatedUser;
    return Object.assign(Object.create(Object.getPrototypeOf(updatedUser)), result);
  }

  async saveRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<Omit<User, 'password'>> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return this.update(userId, { hashedRefreshToken });
  }

  async deleteUser(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    await this.usersRepository.remove(user);

    const { password, ...result } = user;
    return Object.assign(Object.create(Object.getPrototypeOf(user)), result);
  }

  // ✅ Optional sign-in logic hook (can be used in controller/service layer)
  async onUserSignIn(user: User) {
    try {
      await this.mailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email on sign-in:', error);
    }
  }
}
