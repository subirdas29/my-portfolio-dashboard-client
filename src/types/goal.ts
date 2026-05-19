export type TGoalType = 'revenue' | 'blog_posts' | 'clients' | 'orders' | 'custom';
export type TGoalPeriod = 'monthly' | 'quarterly' | 'yearly';

export type TGoal = {
  _id: string;
  title: string;
  type: TGoalType;
  period: TGoalPeriod;
  target: number;
  current: number;
  unit: string;
  year: number;
  month?: number;
  quarter?: number;
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
