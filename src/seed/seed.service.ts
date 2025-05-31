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

      // Clear users table
      await queryRunner.query('DELETE FROM users');
      this.logger.log('Users table cleared successfully.');

      // Prepare users array
      const users: User[] = [];

      // Generate 30 users
      this.logger.log('Generating 30 users...');
      for (let i = 0; i < 30; i++) {
        const user = new User();
        user.username = faker.internet.userName() + '_' + i; 
        user.email = faker.internet.email().toLowerCase();
        user.password = 'password123';
        user.role = faker.helpers.arrayElement([UserRole.ADMIN, UserRole.USER]);

        users.push(user);
      }

      // Save all users at once - ONLY ONCE
      const savedUsers = await queryRunner.manager.save(users);
      this.logger.log(`Successfully saved ${savedUsers.length} users`);

      await queryRunner.commitTransaction();
      this.logger.log('Seeding completed successfully.');
      
      // Return the actual seeded users along with a message
      return { 
        message: `Database seeded with ${savedUsers.length} users`,
        users: savedUsers
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error during seeding process:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
