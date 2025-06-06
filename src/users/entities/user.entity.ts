import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number; // Changed from user_id to id to match service

  @Column({ unique: true })
  @Column({ nullable: true })
  name: string; // Changed from username to name to match service

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // This makes password not selected by default
  password: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  @Column({ type: 'text', nullable: false, default: '' })
  hashedRefreshToken: string;

  @OneToMany(() => Expense, expense => expense.user)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async handleRefreshToken() {
    if (this.hashedRefreshToken === null) {
      this.hashedRefreshToken = '';
    }
  }

  // Add a method to hash the refresh token
  async setRefreshToken(refreshToken: string) {
    if (refreshToken) {
      this.hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    } else {
      this.hashedRefreshToken = 'null';
    }
  }

  // Add a method to validate the refresh token
  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!this.hashedRefreshToken || this.hashedRefreshToken === '') {
      return false;
    }
    return await bcrypt.compare(refreshToken, this.hashedRefreshToken);
  }
}
