import { create } from 'zustand';
import { Transaction } from '../components/dashboard/RecentTransactions';
import { supabase } from '../lib/supabase';

export type Transaction = {
  id : string;
  user_id : string;
  type : string;
  category : 'income' | 'expense';
  amount : number;
  date : Date;
};

interface TransactionStore {
  transactions: Transaction[];
  fetchTransactions: (user_Id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addTransactions: (transactions: Omit <Transaction, "id">[], userId: string) => Promise<void>;
  updateTransaction: (id: string, data: Omit<Transaction, "id" | "user_id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],

  fetchTransactions: async (userId:string) => {
  const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false });

  
  if (error) {
    console.error("Fetching error", error.message);
  } else {
    set({ transaction: data.map((t) => ({...t, date: new Date(t.date) })) });
    }
  },


  addTransaction: async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error.message);
      return;
    }

    set((state) => ({
      transactions: [{ ...data, date: new Date(data.date) }, ...state.transactions],
    }));
  },

  addTransactions: async (transactions, userId) => {
    const enriched = transactions.map((t) => ({
      ...t,
      user_id: userId,
    }));

    const { data, error } = await supabase
      .from('transactions')
      .insert(enriched)
      .select();

    if (error) {
      console.error('Bulk insert error:', error.message);
      return;
    }

    set((state) => ({
      transactions: [
        ...data.map((t) => ({ ...t, date: new Date(t.date) })),
        ...state.transactions,
      ],
    }));
  },

  updateTransaction: async (id, data) => {
    const { error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Update error:', error.message);
      return;
    }

    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error.message);
      return;
    }

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },
}));