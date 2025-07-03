import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useTransactionStore } from '../stores/transactionStore';
import { useBudgetStore } from '../stores/budgetStore';
import { useSavingsStore } from '../stores/savingsStore';
import { mockBudget, mockGoal, mockTransactions } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL

//custom react hook that can be called from anywhere
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // used to grab zustand store states from each store
  useEffect(() => {
    const txStore = useTransactionStore.getState();
    const budgetStore = useBudgetStore.getState();
    const goalStore = useSavingsStore.getState();

    // Get the current session -> checks if user is logged in or if guest mode is active
    const getInitialSession = async () => {
      setIsLoading(true);
      
      //depending on session, appropriate data is loaded. user data for users and mockdata for guests
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
          //load user data
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

    // Listen for auth changes and updates data depending on user/guest session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      const isGuestFlag = localStorage.getItem("isGuest") === "true";
      setIsGuest(isGuestFlag);

      if (!session?.user && isGuestFlag) {
        //load mock data for guest
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

  //login for user, using password and email stored in supabase
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      //sets the session to match user and clears guest state on success.
      setIsGuest(false);
      localStorage.removeItem('isGuest');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  //login for guests -> loads mockdata
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

  //register account for users and saves email and password in supabase. When successfull clears guest state
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

  //Logs user out via Supabase and resets stores to prevent leaks
  const signOut = async () => {
    try {
      const session =await supabase.auth.getSession();
      const jwt = session.data?.session?.access_token;
      const email = session.data?.session?.user?.email;
      
      if (email === "guest@budgetmaster.com" && jwt) {
        try {
          const res = await fetch(`${API_URL}/reset-guest`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          if (!res.ok) {
            const err = await res.json();
            console.error("Guest reset failed:", err);
          } else {
            console.log("Guest reset successful");
          }
        } catch (resetError) {
          console.error("error reaching reset endpoint:", resetError);
        }
      }

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