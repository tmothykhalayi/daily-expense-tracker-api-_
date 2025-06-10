import { Report } from '../entities/report.entity';

export interface ReportWithTotals extends Report {
  total: number;
  averagePerDay: number;
  categoryTotals: Record<string, number>;
}