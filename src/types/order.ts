export type TOrderStatus = 'Pending' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';

export type TMilestone = {
  _id: string;
  title: string;
  dueDate?: string;
  done: boolean;
};

export type TNote = {
  _id?: string;
  content: string;
  createdAt: string;
};

export type TOrder = {
  _id: string;
  clientId: { _id: string; name: string; email: string; company?: string } | string;
  title: string;
  description?: string;
  status: TOrderStatus;
  budget?: number;
  currency: string;
  paidAmount: number;
  startDate?: string;
  deadline?: string;
  completedAt?: string;
  milestones: TMilestone[];
  notes?: TNote[];
  projectId?: string;
  invoiceUrl?: string;
  contractUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type TRevenueMonth = {
  month: string;
  revenue: number;
  budget: number;
  count: number;
};
