import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Define the savings goal type based on DB structure
export type SavingsGoal = {
  id: string;
  title: string; // name of the goal
  targetAmount: number;
  currentAmount: number;
  user_id: string;
  created_at : date;
};

// Zustand store shape
type SavingsStore = {
  goals: SavingsGoal[];
  fetchGoals: (userId: string) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addFunds: (id: string, amount: number) => Promise<void>;
};

export const useSavingsStore = create<SavingsStore>((set, get) => ({
  goals: [],

  // Fetch all goals for a user from Supabase
  fetchGoals: async (userId) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);

    if (!error && data) {
      set({
        goals: data.map((goal) => ({
          ...goal,
          deadline: new Date(goal.deadline),
        })),
      });
    } else {
      console.error("Failed to fetch goals:", error)
    }
  },

  // Add a new goal for the logged-in user
  addGoal: async (goal, userId) => {
    console.log("saving goal:", goal, "for user", userId);

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{...goal, user_id : userId }])
      .select();

    if (error) {
      console.error('Error adding goal to supabase:', error);
    } else {
    console.log('Saved goal:', data);
    set((state) => ({ goals: [...state.goals, ...data] }));

    if (!error && data) {
      //convert deadline from string to date
      const normalized = data.map(g => ({
        ...g,
        deadline: new Date(g.deadline),
      }));

      set((state) => ({ goals: [...state.goals, ...normalized]}));
    } else {
      console.error("supabase insert error:", error)
    }
  }
},

  // Update goal locally and in Supabase
  updateGoal: async (id, updates) => {
    const { error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating goal:', error);
    } else {
      set((state) => ({
        goals: state.goals.map(goal => goal.id === id ? { ...goal, ...updates } : goal)
      }));
    }
  },

  // Delete goal from local state and Supabase
  deleteGoal: async (id) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
    } else {
      set((state) => ({
        goals: state.goals.filter(goal => goal.id !== id)
      }));
    }
  },

  // Add funds to an existing goal
  addFunds: async (id, amount) => {
    const goal = get().goals.find(goal => goal.id === id);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;

    const { error } = await supabase
      .from('savings_goals')
      .update({ currentAmount: newAmount })
      .eq('id', id);

    if (error) {
      console.error('Error adding funds:', error);
    } else {
      set((state) => ({
        goals: state.goals.map(g =>
          g.id === id ? { ...g, currentAmount: newAmount } : g
        )
      }));
    }
  }
}));