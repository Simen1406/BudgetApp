import { create } from 'zustand';
import { Transaction } from '../components/dashboard/RecentTransactions';
import { mockTransactions } from '../data/mockData';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addTransactions: (transactions: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: mockTransactions,
  
  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, { ...transaction, id: crypto.randomUUID() }]
  })),
  
  addTransactions: (newTransactions) => set((state) => ({
    transactions: [...state.transactions, ...newTransactions]
  })),
  
  deleteTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),
  
  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    )
  }))
}));