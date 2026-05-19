export type TClientStatus = 'Lead' | 'Active' | 'Completed' | 'Churned';
export type TClientSource = 'contact_form' | 'referral' | 'social' | 'direct' | 'other';

export type TClient = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  status: TClientStatus;
  source?: TClientSource;
  notes?: string;
  tags?: string[];
  linkedMessageId?: string;
  createdAt: string;
  updatedAt: string;
};
