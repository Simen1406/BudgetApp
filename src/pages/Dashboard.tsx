import { useState, useEffect, useMemo } from 'react';
import { CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatCurrency';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Components
import StatCard from '../components/dashboard/StatCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetSummary from '../components/dashboard/BudgetSummary';
import SavingsGoalsList from '../components/dashboard/SavingsGoalsList';

// Mock data (will be replaced with actual data from backend)
import { mockTransactions } from '../data/mockData';

import { Transaction } from '../types/transactionsType';
import { calculateTransactionTotals } from '../utils/transactionCalculator';

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedMonth = format(currentMonth, 'yyyy-MM');
  

  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data: {session},
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.warn("Guest user or not authenticated, loading mock data");
        setTransactions(mockTransactions);
        return;
      }
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id);

      if (error || !data) {
        console.error("Error fetching transactions:", error);
        setTransactions(mockTransactions);
        return;
      }

      if (data.length === 0) {
        console.log("No transactions found for user, using mock data");
        setTransactions(mockTransactions);
      } else {
        setTransactions(data as Transaction[]);
      }
    };
    fetchTransactions();
    }, []);
    
    //calculate totals
    const {
      totalIncome,
      totalExpenses,
      netTotal,
      incomeCount,
      expenseCount
    } = useMemo(() => {
      return calculateTransactionTotals(transactions, selectedMonth);
      }, [transactions, selectedMonth]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">{format(currentDate, 'MMMM d, yyyy')}</p>
        </div>

        {/*month navigation*/}
        <div className='flex items-center gap-2 mt-4 sm:mt-0'>
          <button
            className='btn btn-outline'
            onClick={() =>{
              const newDate = new Date (currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
          >
            Previous
          </button>

          <span className="text-gray-600 font-medium">
            {format(currentMonth, 'MMMM-yyyy')}
          </span>

          <button
            className='btn btn-outline'
            onClick={() =>{
              const newDate = new Date (currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp className="h-6 w-6 text-success-600" />}
          valueClassName="text-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown className="h-6 w-6 text-danger-600" />}
          valueClassName="text-red-600"
        />
        <StatCard
          title="Net Total"
          value={formatCurrency(netTotal)}
          icon={<DollarSign className="h-6 w-6 text-primary-600" />}
          valueClassName={netTotal >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <RecentTransactions transactions={mockTransactions.slice(0, 5)} />
        </div>
        
        {/* Budget Summary */}
        <div>
          <BudgetSummary />
        </div>
      </div>

      {/* Savings Goals */}
      <div className="mt-6">
        <SavingsGoalsList />
      </div>
    </div>
  );
};

export default Dashboard;