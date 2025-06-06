import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import BudgetModal from '../components/budgets/BudgetModal';
import { mockBudget } from '../data/mockData';
import { Budget } from '../types/budget';
import { calculateFoodSpentForMonth } from '../utils/budgetHelper'
import { format } from 'date-fns';
import { Transaction } from '../types/transactionsType';


type BudgetStore = {
  budgets: Budget[];
  loading: boolean;
  currentMonth: Date;
  fetchBudgets: (userId: string, month: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | "user_id">, userId: string) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setBudgets: (budgets: Budget[]) => void;
  setCurrentMonth: (date: Date) => void;
  fetchAndSyncFoodBudget: (userId: string, transactions: Transaction[], currentMonth: Date) => Promise<void>;
}

const budgetCache = new Map<string, Budget[]>();

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: [],
  loading: false,
  currentMonth: new Date(),

  setCurrentMonth: (date) => set({currentMonth:date }),
  //set mock budget for guest login
  setBudgets: (budgets) => set({ budgets }),

  //fetch budgets
  fetchBudgets: async (userId, month) => {
    if (budgetCache.has(month)) {
      set({ budgets: budgetCache.get(month)!, loading:false });
      return;
    }

    const [monthly, recurring] = await Promise.all([
    supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month), // month = '2025-07'

    supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
  ]);

  const combinedMap = new Map();
  [...(monthly.data || []), ...(recurring.data || [])].forEach(b => 
    combinedMap.set(b.id, b)
  );

   const budgets = Array.from(combinedMap.values());
    budgetCache.set(month, budgets)

    set({budgets, loading:false});
},
  fetchAndSyncFoodBudget: async (userId: string, transactions : Transaction[], currentMonth: Date) => {
    const monthString = format(currentMonth, 'yyyy-MM');
    const spent = calculateFoodSpentForMonth(transactions, currentMonth);
    const plannedAmount = 4000;
    /*
    function normalizeCategoryName(name:string) {
      if (!name) return '';
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    const normalizedCategory = normalizeCategoryName('food');*/

    const { data: existingBudgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', monthString)
      .ilike('name', 'food');

    if (error) {
      console.error("error fethcing budgets", error);
      return;
    }

    if (existingBudgets && existingBudgets.length > 0) {
      const existingBudget = existingBudgets[0];
      await supabase
        .from('budgets')
        .update({
          moneySpent: spent,
          plannedBudget: existingBudget.plannedBudget || plannedAmount, })
        .eq('id', existingBudget.id);
    } else {
      await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        name: 'food',
        plannedBudget: plannedAmount,
        moneySpent: spent,
        month: monthString,
        is_recurring: false,
      });
    }
    await get().fetchBudgets(userId, monthString);
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
    await supabase.from('budgets').delete().eq('id', id);
    const updatedBudgets = get().budgets.filter(b => b.id !== id);
    set({ budgets: updatedBudgets });
  },
}));