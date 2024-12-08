export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  description: string;
  paid: boolean;
  enableNotification: boolean;
  notificationTime: string;
  notificationDate: string;
}

export type FilterStatus = 'all' | 'paid' | 'unpaid';
