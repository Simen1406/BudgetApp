import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import BudgetModal from '../components/budgets/BudgetModal';
import { mockBudget } from '../data/mockData';
import { Budget } from '../types/budget';
import { calculateFoodSpentForMonth } from '../utils/budgetHelper'
import { format, addMonths } from 'date-fns';
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

  const currentBudgets = get().budgets;
  if(currentBudgets.length > 0 && currentBudgets[0].month === month) {
    console.log("budgets already loaded, skipping refetch.");
    return;
  }

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month); // ONLY fetch budgets for current month
  console.log('Fetched budgets from Supabase:', data);

  if (error) {
    console.error('Error fetching budgets:', error);
    set({ budgets: [], loading: false });
    return;
  }


  budgetCache.set(month, data || []);
  set({ budgets: data || [], loading: false });
},
//creates a food budget for all months and takes all transaction for current month related to food and adds them into spent amount of food budget.
  fetchAndSyncFoodBudget: async (userId: string, transactions : Transaction[], currentMonth: Date) => {
    const monthString = format(currentMonth, 'yyyy-MM');
    const spent = calculateFoodSpentForMonth(transactions, currentMonth);

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
        .update({moneySpent: spent})
        .eq('id', existingBudget.id);
    } /*else {
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
    }*/
    await get().fetchBudgets(userId, monthString);
  },
  
  // Creation, update, deletion of budgets by user 
  addBudget: async (budget, userId) => {
    const monthString = format(new Date(budget.month), 'yyyy-MM');

    if (budget.is_recurring) {
      const monthsToCreate = 12;
      const startMonth = new Date(budget.month);
      const budgetsToInsert = [];

      for (let i = 0; i < monthsToCreate; i++) {
        const monthDate = addMonths(startMonth, i);
        const monthStr = format(monthDate, 'yyyy-MM');

        budgetsToInsert.push({
          user_id: userId,
          name: budget.name,
          plannedBudget: budget.plannedBudget,
          moneySpent: 0,
          month: monthStr,
          is_recurring: true,
        });
      }

      console.log("Inserting recurring budgets:", budgetsToInsert);

      const { data, error} = await supabase
      .from("budgets")
      .insert(budgetsToInsert)
      .select();

    if (!error && data) {
      set((state) => ({
        budgets: [...state.budgets, ...data],
      }));
      budgetCache.delete(monthString)

      await new Promise(res => setTimeout(res, 500));
      await get().fetchBudgets(userId, monthString);
    } else {
      console.error("failed to add budget:", error);
    };
    

  } else {
    const { data, error} = await supabase
      .from("budgets")
      .insert([{...budget, user_id: userId, month: monthString}])
      .select();
    console.log("Supabase insert returned:", data);

    if (!error && data) {
      set((state) => ({
        budgets: [...state.budgets, ...data],
      }));
      budgetCache.delete(monthString)
      await get().fetchBudgets(userId, monthString);
    } else {
      console.error("failed to add budget:", error);
    }
    }
  },

  updateBudget: async (id, updates) => {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select();

   { if (!error && data && data[0]) {
      const updatedBudget = data[0];
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? updatedBudget : b
        ),
      }));
      budgetCache.delete(updatedBudget.month)
    } else {
      console.error('Error updating budget:', error);
    }}
  },
  
  deleteBudget: async (id) => {
    const budgetToDelete = get().budgets.find(b => b.id === id);
    if (!budgetToDelete) {
      console.error('Budget not found');
      return;
    }

    const {error} = await supabase
      .from("budgets")
      .delete()
      .eq('id', id)

    if(!error) {
      const updatedBudgets = get().budgets.filter(b => b.id !== id);
      set({ budgets: updatedBudgets });

      budgetCache.delete(budgetToDelete.month);
      } else {
        console.error('Error deleting budget:', error);
      }
    
  },
}));