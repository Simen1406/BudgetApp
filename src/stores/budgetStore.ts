import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import BudgetModal from '../components/budgets/BudgetModal';
import { mockBudget } from '../data/mockData';
import { Budget } from '../types/budget';


type BudgetStore = {
  budgets: Budget[];
  fetchBudgets: (userId: string, month: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | "user_id">, userId: string) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setBudgets: (budgets: Budget[]) => void;
}


export const useBudgetStore = create<BudgetStore>((set) => ({
  budgets: [],

  //set mock budget for guest login
  setBudgets: (budgets) => set({ budgets }),

  //fetch budgets
  fetchBudgets: async (userId, month) => {
    const { data, error} = await supabase
    .from('budgets')
    .select("*")
    .eq('user_id', userId)
    .or(`month.eq.${month},is_recurring.eq.true`)

    if (error) {
      console.error("failed to fetch budgets:", error);
      set ({ budgets: [mockBudget] });
      return;
    }

    if (!data || data.length === 0) {
      set ({ budgets: [mockBudget] });
      return;
    }
    
    set({ budgets: data });
  },
  
  // Creation, update, deletion of budgets by user 
  addBudget: async (budget, userId) => {
    const { data, error} = await supabase
      .from("budgets")
      .insert([{...budget, user_id: userId}])
      .select();

    if (!error && data) {
      set((state) => ({
        budgets: [...state.budgets, ...data],
      }));
    } else {
      console.error("failed to add budget:", error);
    }
  },

  updateBudget: async (id, updates) => {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select();

    if (!error && data) {
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? data[0] : b
        ),
      }));
    } else {
      console.error('Error updating budget:', error);
    }
  },
  
  deleteBudget: async (id) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
    } else {
      console.error('Error deleting budget:', error);
    }
  },
}));