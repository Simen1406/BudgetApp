import { Budget } from '../types/budget';
import { Transaction } from '../types/transactionsType';
import { SavingsGoal } from '../types/savingType';

export const mockTransactions: Transaction[] = [
  {
    id: 'mock-1',
    user_id: 'guest',
    type: 'Salary',
    category: 'income',
    amount: 3000,
    date: new Date(2023, 5, 1),
  },
  {
    id: 'mock-2',
    user_id: 'guest',
    type: 'rent',
    category: 'expense',
    amount: 1200,
    date: new Date(2023, 5, 2),
  },
  {
    id: 'mock-3',
    user_id: 'guest',
    type: 'groceries',
    category: 'expense',
    amount: 150,
    date: new Date(2023, 5, 5),
  },
  {
    id: 'mock-4',
    user_id: 'guest',
    type: 'Utilities',
    category: 'expense',
    amount: 100,
    date: new Date(2023, 5, 10),
  },
  {
    id: 'mock-5',
    user_id: 'guest',
    type: 'Dining Out',
    category: 'expense',
    amount: 50,
    date: new Date(2023, 5, 15),
  },
];


export const mockGoal: SavingsGoal = {
  id: 'mock-goal',
  user_id: 'guest',
  name: 'Vacation Fund',
  targetAmount: 10000,
  savedAmount: 2000,
  deadline: new Date('2025-12-31'),
};

export const mockBudget: Budget = {
  id: 'mock-budget',
  user_id: 'guest',
  name: 'Monthly Expenses',
  plannedBudget: 5000,
  moneySpent: 2500,
  month: 'july',
  is_recurring: true,
};

export const mockTransactionTypes: string[] = [
  'Salary',
  'Rent',
  'Groceries',
  'Utilities',
  'Dining Out',
  'Transfer',
];