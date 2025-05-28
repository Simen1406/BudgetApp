import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { mockGoal } from '../data/mockData';
import { SavingsGoal } from '../types/savingType';


// Zustand store shape
type SavingsStore = {
  goals: SavingsGoal[];
  fetchGoals: (userId: string) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id' | "user_id">, userId : string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addFunds: (id: string, amount: number) => Promise<void>;
  setGoals: (goasl: SavingsGoal[]) => void;
};

export const useSavingsStore = create<SavingsStore>((set, get) => ({
  goals: [],


  //fetch mock goals for users not logged in
  setGoals: (goals) => set ({ goals }),

  // Fetch all goals for a logged in user from Supabase
  fetchGoals: async (userId) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);

    if (!data || data.length === 0) {
      // If no goals are found, fetch mock goals
      set({goals: [mockGoal] });
      return;
    }

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
    .insert([{ ...goal, user_id: userId }])
    .select();

  if (error) {
    console.error(' Error adding goal to Supabase:', error);
    return;
  }

  if (data) {
    console.log('✅ Saved goal:', data);

    const normalized = data.map(g => ({
      ...g,
      deadline: new Date(g.deadline), // convert to Date so UI doesn't crash
    }));

    set((state) => ({
      goals: [...state.goals, ...normalized],
    }));
  }
},

  // Update goal locally and in Supabase
  updateGoal: async (id: string, updates) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update({
      ...updates,
      deadline: updates.deadline ? new Date(updates.deadline).toISOString() : undefined, // ensure correct format for date
    })
    .eq('id', id)
    .select();

  if (!error && data) {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...data[0], deadline: new Date(data[0].deadline) } : g
      ),
    }));
  } else {
    console.error('Failed to update goal:', error);
  }
},

  // Delete goal from local state and Supabase
  deleteGoal: async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));
  } else {
    console.error("failed to delete goal:", error)
  }
},

  // Add funds to an existing goal
  addFunds: async (id: string, amount: number) => {
  const goal = get().goals.find((g) => g.id === id);
  if (!goal) return;

  const newAmount = goal.savedAmount + amount;

  const { data, error } = await supabase
    .from('savings_goals')
    .update({ savedAmount: newAmount })
    .eq('id', id)
    .select();

  if (!error && data) {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...data[0], deadline: new Date(data[0].deadline) } : g
      ),
    }));
  } else {
    console.error('Failed to add funds to goal:', error);
  }
}
}));