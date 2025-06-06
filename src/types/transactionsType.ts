export type Transaction = {
  id: string;
  user_id: string;
  date: Date;
  type: string;
  category: 'income' | 'expense';
  amount: number;
  description: string;
  is_recurring?: boolean;
};