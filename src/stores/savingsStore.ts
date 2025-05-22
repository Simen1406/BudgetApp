import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  createdAt: Date;
}

interface SavingsStore {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addFunds: (id: string, amount: number) => void;
}

export const useSavingsStore = create<SavingsStore>((set) => ({
  goals: [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      savedAmount: 3500,
      deadline: new Date(2025, 5, 30),
      createdAt: new Date(2023, 3, 15),
    },
    
  ],
  
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, { ...goal, id: crypto.randomUUID(), createdAt: new Date() }]
  })),
  
  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    )
  })),
  
  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter(goal => goal.id !== id)
  })),
  
  addFunds: (id, amount) => set((state) => ({
    goals: state.goals.map(goal =>
      goal.id === id ? { ...goal, savedAmount: goal.savedAmount + amount } : goal
    )
  }))
}));