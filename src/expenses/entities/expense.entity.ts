import { User } from '../../users/entities/user.entity';
export class Expense {
    id: number;
    userId: number;
    amount: number;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
   user: User;
    
    constructor(
        id: number,
        userId: number,
        amount: number,
        description: string,
        date: Date,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.description = description;
        this.date = date;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

}
