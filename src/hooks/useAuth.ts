import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useTransactionStore } from '../stores/transactionStore';
import { useBudgetStore } from '../stores/budgetStore';
import { useSavingsStore } from '../stores/savingsStore';
import { mockBudget, mockGoal, mockTransactions } from '../data/mockData';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const txStore = useTransactionStore.getState();
    const budgetStore = useBudgetStore.getState();
    const goalStore = useSavingsStore.getState();

    // Get the current session
    const getInitialSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isGuestFlag = localStorage.getItem('isGuest') === 'true';

        setUser(session?.user || null);
        setIsGuest(isGuestFlag);

        if (isGuestFlag) {
          // load mock data
          txStore.setTransactions(mockTransactions);
          budgetStore.setBudgets([mockBudget]);
          goalStore.setGoals([mockGoal]);
        }

        if (session?.user && !isGuestFlag) {
          await Promise.all([
            txStore.fetchTransactions(session.user.id),
            budgetStore.fetchBudgets(session.user.id),
            goalStore.fetchGoals(session.user.id),
          ]);
        }

      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      const isGuestFlag = localStorage.getItem("isGuest") === "true";
      setIsGuest(isGuestFlag);

      if (!session?.user && isGuestFlag) {
        txStore.setTransactions(mockTransactions);
        budgetStore.setBudgets([mockBudget]);
        goalStore.setGoals([mockGoal]);
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      setIsGuest(false);
      localStorage.removeItem('isGuest');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');

    const txStore = useTransactionStore.getState();
    const budgetStore = useBudgetStore.getState();
    const goalStore = useSavingsStore.getState();

    txStore.setTransactions(mockTransactions);
    budgetStore.setBudgets([mockBudget]);
    goalStore.setGoals([mockGoal]);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      setIsGuest(false);
      localStorage.removeItem('isGuest');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      //reset zustand store to prevent user data leaks
      useTransactionStore.getState().setTransactions([]);
      useBudgetStore.getState().setBudgets([]);
      useSavingsStore.getState().setGoals?.([]);

      setIsGuest(false);
      localStorage.removeItem('isGuest');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    isLoading,
    isGuest,
    signIn,
    signInAsGuest,
    signUp,
    signOut,
  };
}