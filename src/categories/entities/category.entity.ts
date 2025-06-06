
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number;
  
  
  @CreateDateColumn()
  created_at: Date;


  @Column({ length: 100, unique: true })
  category_name: string;

 
}