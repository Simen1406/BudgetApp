import { Transaction } from '../types/transactionsType';
import { format } from 'date-fns';

export const calculateTransactionTotals = (transactions: Transaction[], selectedMonth: string) => {
  const filteredTransactions = transactions.filter((t) => {
    const transactionMonth = format(
        typeof t.date === 'string' ? new Date(t.date): t.date, 'yyyy-MM');
    return transactionMonth === selectedMonth;
  });
  //console.log("selected month", selectedMonth);
  //console.log('Filtered Transactions:', filteredTransactions);

  const incomeTransactions = filteredTransactions.filter((t) => t.category === 'income');
  const expenseTransactions = filteredTransactions.filter((t) => t.category === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const incomeCount = incomeTransactions.length;
  const expenseCount = expenseTransactions.length;

  return {
    totalIncome,
    totalExpenses,
    netTotal: totalIncome - totalExpenses,
    incomeCount,
    expenseCount,
  };
};