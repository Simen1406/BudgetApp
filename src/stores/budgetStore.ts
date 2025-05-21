import { create } from 'zustand';

interface Budget {
  id: string;
  category: string;
  plannedAmount: number;
  actualAmount: number;
  month: Date;
}

interface BudgetStore {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  budgets: [
    {
      id: '1',
      category: 'Housing',
      plannedAmount: 1200,
      actualAmount: 1200,
      month: new Date(),
    },
    {
      id: '2',
      category: 'Food',
      plannedAmount: 500,
      actualAmount: 430,
      month: new Date(),
    },
    {
      id: '3',
      category: 'Transportation',
      plannedAmount: 200,
      actualAmount: 180,
      month: new Date(),
    },
  ],
  
  addBudget: (budget) => set((state) => ({
    budgets: [...state.budgets, { ...budget, id: crypto.randomUUID() }]
  })),
  
  updateBudget: (id, updates) => set((state) => ({
    budgets: state.budgets.map(budget => 
      budget.id === id ? { ...budget, ...updates } : budget
    )
  })),
  
  deleteBudget: (id) => set((state) => ({
    budgets: state.budgets.filter(budget => budget.id !== id)
  }))
}));