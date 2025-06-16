import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
  this.logger.log('Starting seeding process...');

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();
    this.logger.log('Clearing existing data...');

    try {
      await queryRunner.query('DELETE FROM reports');
      this.logger.log('Reports table cleared successfully.');
    } catch (error) {
      this.logger.warn('Could not clear reports table, it might not exist yet.');
    }

    try {
      await queryRunner.query('DELETE FROM categories');
      this.logger.log('Categories table cleared successfully.');
    } catch (error) {
      this.logger.warn('Could not clear categories table, it might not exist yet.');
    }

    try {
      await queryRunner.query('DELETE FROM users');
      this.logger.log('Users table cleared successfully.');
    } catch (error) {
      this.logger.warn('Could not clear users table, it might not exist yet.');
    }

    // Seed users only
    const users: User[] = [];
    for (let i = 0; i < 30; i++) {
      const user = new User();
      user.name = faker.internet.userName() + '_' + i;
      user.email = faker.internet.email().toLowerCase();
      user.password = 'password123'; 
      user.role = faker.helpers.arrayElement([UserRole.ADMIN, UserRole.USER]);
      users.push(user);
      console.log(`User ${i + 1}: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    }

    const adminUser = new User();
    adminUser.name = 'admin';
    adminUser.email = 'admin@gmail.com';
    adminUser.password = 'admin123'; 
    adminUser.role = UserRole.ADMIN;
    users.push(adminUser);

    const savedUsers = await queryRunner.manager.save(users);
    this.logger.log(`${savedUsers.length} users seeded successfully`);

    await queryRunner.commitTransaction();
    this.logger.log('Seeding completed successfully.');

    return { 
      message: `Database seeded with ${savedUsers.length} users`,
      users: savedUsers.length,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    this.logger.error(`Error during seeding process: ${error.message}`);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
}