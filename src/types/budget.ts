export type Budget = {
  id: string; // You can use 'mock-budget' for the mock
  user_id: string;
  name: string;
  plannedBudget: number;
  moneySpent: number;
  month: string; // format: 'YYYY-MM'
  is_recurring: boolean;
};