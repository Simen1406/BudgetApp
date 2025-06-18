import { supabase } from './supabase'
import { Transaction } from '../types/transactionsType'

// retrieves transactions that matches userId
export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
  //query for transactions table in supabase.
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('❌ Error fetching transactions:', error.message)
    return []
  }

  // Ensure date field is cast to Date
  return (data as Transaction [] ?? []).map((t) => ({ 
    ...t,
    date: new Date(t.date),
  }))
}

//inserts transactions that matches userId and ensures correct date format. 
export async function insertTransactionsForUser(
  userId: string,
  transactions: Omit<Transaction, 'id' | 'user_id'>[]
): Promise<Transaction[] | null> {
  const enriched = transactions.map((t) => ({
    ...t,
    user_id: userId,
    date: new Date(t.date).toISOString(),
  }))

  const { data, error } = await supabase.from('transactions').insert(enriched).select();

  if (error) {
    console.error('❌ Error inserting transactions:', error.message)
    return null
  }

  return (data ?? []).map((t) => ({
    ...t,
    date: new Date(t.date),
  }));
}