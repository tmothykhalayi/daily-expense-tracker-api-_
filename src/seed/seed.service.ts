import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Report } from 'src/reports/entities/report.entity';
import { DataSource, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    this.logger.log('Starting seeding process...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Clear existing data - use try/catch for each deletion to handle tables that might not exist yet
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

      // Seed users
      const users: User[] = [];
      for (let i = 0; i < 50; i++) {
        const user = new User();
        user.username = faker.internet.userName() + '_' + i;
        user.email = faker.internet.email().toLowerCase();
        user.password = 'password123'; 
        user.role = faker.helpers.arrayElement([UserRole.ADMIN, UserRole.USER]);
        users.push(user);
      }
      
    
      const adminUser = new User();
      adminUser.username = 'admin';
      adminUser.email = 'admin@example.com';
      adminUser.password = 'admin123'; 
      adminUser.role = UserRole.ADMIN;
      users.push(adminUser);
      
      const savedUsers = await queryRunner.manager.save(users);
      this.logger.log(`${savedUsers.length} users seeded successfully`);
      
      // Seed categories
      const categoryData = [
        { category_name: 'Food', description: 'Groceries, restaurants, and meal deliveries' },
        { category_name: 'Transportation', description: 'Gas, public transit, rideshares, and vehicle maintenance' },
        { category_name: 'Housing', description: 'Rent, mortgage, repairs, and home improvement' },
        { category_name: 'Entertainment', description: 'Movies, games, events, and subscriptions' },
        { category_name: 'Healthcare', description: 'Doctor visits, medications, and insurance' },
        { category_name: 'Education', description: 'Tuition, books, and courses' },
        { category_name: 'Utilities', description: 'Electricity, water, internet, and phone bills' },
        { category_name: 'Shopping', description: 'Clothing, electronics, and other retail purchases' },
        { category_name: 'Travel', description: 'Flights, hotels, and vacation expenses' },
        { category_name: 'Personal Care', description: 'Haircuts, gym memberships, and wellness' },
        { category_name: 'Gifts & Donations', description: 'Presents, charitable contributions' },
        { category_name: 'Business', description: 'Work-related expenses and professional services' }
      ];
      
      const categories = categoryData.map(cat => {
        const category = this.categoryRepository.create(cat);
        return category;
      });
      
      const savedCategories = await queryRunner.manager.save(categories);
      this.logger.log(`${savedCategories.length} categories seeded successfully`);
      
      // Seed reports
      const reports: {userId: number; startDate: Date; endDate: Date}[] = [];
      // Current date for more realistic data
      const today = new Date();
      
      
      for (const user of savedUsers) {
        // Add a report for last month
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        reports.push({
          userId: user.user_id,
          startDate: firstDayLastMonth, 
          endDate: lastDayLastMonth
        });
        
        // Add a report for current month
        const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        reports.push({
          userId: user.user_id, 
          startDate: firstDayCurrentMonth, 
          endDate: today // Today
        });
      }
      
      const createdReports = reports.map(report => this.reportRepository.create(report));
      const savedReports = await queryRunner.manager.save(createdReports);
      this.logger.log(`${savedReports.length} reports seeded successfully`);

      await queryRunner.commitTransaction();
      this.logger.log('Seeding completed successfully.');
      
      return { 
        message: `Database seeded with ${savedUsers.length} users, ${savedCategories.length} categories, and ${savedReports.length} reports`,
        users: savedUsers.length,
        categories: savedCategories.length, 
        reports: savedReports.length
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
