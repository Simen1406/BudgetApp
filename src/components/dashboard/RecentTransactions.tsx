import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  note?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <Link to="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View all
        </Link>
      </div>
      
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <li key={transaction.id} className="py-4 hover:bg-gray-50 px-4 -mx-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-success-100' : 'bg-danger-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className={`h-4 w-4 text-success-600`} />
                    ) : (
                      <ArrowDownLeft className={`h-4 w-4 text-danger-600`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.category}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {format(transaction.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">No recent transactions</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default RecentTransactions;