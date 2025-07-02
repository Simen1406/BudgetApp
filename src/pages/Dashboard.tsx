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

// Mock data (will be replaced with actual data from backend, if user is logged in. Under development).
import { mockTransactions } from '../data/mockData';

import { Transaction } from '../types/transactionsType';
import { calculateTransactionTotals } from '../utils/transactionCalculator';

//component containing states, logic and rendering.
const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedMonth = format(currentMonth, 'yyyy-MM');
  
  //checks user session and fetches transactions from supabase if user is logged in.
  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data: {session},
        error: sessionError,
      } = await supabase.auth.getSession();

      //sets mock transactions when is not authenticated or guest
      if (sessionError || !session?.user) {
        console.warn("Guest user or not authenticated, loading mock data");
        setTransactions(mockTransactions);
        return;
      }
      
      //fetch user transactions from supabase
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id);

      // if any error occur or it returned nothing sets mock transactions
      if (error || !data) {
        console.error("Error fetching transactions:", error);
        setTransactions(mockTransactions);
        return;
      }

      //Checks for transaction length. If new user mockdata will be rendered untill data is imported/added by user
      if (data.length === 0) {
        console.log("No transactions found for user, using mock data");
        setTransactions(mockTransactions);
      } else {
        setTransactions(data as Transaction[]);
      }
    };
    fetchTransactions();
    }, []);

    //cache for transactions - might be redundant
    const filteredTransactions = useMemo(() => {
      const sourceTransactions = transactions.length === 0 ? mockTransactions : transactions;

      //filters transactions by month and ensures that the array only include transactions for current month
      return transactions.filter((t) => {
        const transactionMonth = format(new Date(t.date), 'yyyy-MM');
        return transactionMonth === selectedMonth;
      });
    }, [transactions, currentMonth]);
    
    //calculate totals using function from transactionCalculator. 
    const {
      totalIncome,
      totalExpenses,
      netTotal,
    } = useMemo(() => {
      return calculateTransactionTotals(transactions, selectedMonth);
      }, [transactions, selectedMonth]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/*Header and month visualization*/}
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

      {/* Stats grid visualizes calculated totals from transaction calculator helper */}
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
          <RecentTransactions transactions={filteredTransactions} />
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