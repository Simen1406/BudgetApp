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

//default types that should always be available when adding new transactions 
export const defaultTransactionTypes = [
  'Loan payment',
  'Rent',
  'Utilities',
  'insurance',
  'felleskostnader',
  'food',
  'transportation',
  'entertainment',
  //More can be added later
]