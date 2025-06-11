import { Report } from '../entities/report.entity';
import { Expense } from '../../expenses/entities/expense.entity';

export interface ReportWithTotals extends Report {
  totalAmount: number;
  averagePerDay: number;
  expenses: Expense[];
  categoryTotals: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}