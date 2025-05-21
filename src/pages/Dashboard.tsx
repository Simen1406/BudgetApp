import { useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatCurrency';

// Components
import StatCard from '../components/dashboard/StatCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetSummary from '../components/dashboard/BudgetSummary';
import SavingsGoalsList from '../components/dashboard/SavingsGoalsList';

// Mock data (will be replaced with actual data from backend)
import { mockTransactions } from '../data/mockData';

const Dashboard = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const currentDate = new Date();
  
  // Calculate stats based on mock data
  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">{format(currentDate, 'MMMM d, yyyy')}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPeriod('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                period === 'daily'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 text-sm font-medium ${
                period === 'weekly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                period === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp className="h-6 w-6 text-success-600" />}
          change={+4.75}
          trend="up"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown className="h-6 w-6 text-danger-600" />}
          change={-2.1}
          trend="down"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(netSavings)}
          icon={<DollarSign className="h-6 w-6 text-primary-600" />}
          change={+12.4}
          trend="up"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(0)}%`}
          icon={<CreditCard className="h-6 w-6 text-secondary-600" />}
          change={+5.2}
          trend="up"
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