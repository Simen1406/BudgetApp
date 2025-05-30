import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { Transaction } from '../../types/transactionsType';
import { useState } from 'react';



interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleTransactions = transactions.slice(0, visibleCount);

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
          {visibleTransactions.length > 0 ? (
            visibleTransactions.map((transaction) => (
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
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">No recent transactions</li>
          )}
        </ul>
        {visibleCount < transactions.length && (
          <div className='flex justify-center mt-4'>
            <button
              onClick={() => setVisibleCount(visibleCount + 10)}
              className='text-sm text-primary-600 hover:underline'
              >
                Show More
              </button>
          </div>
        )}

        {visibleCount > 5 && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setVisibleCount(5)}
              className="text-sm text-primary-600 hover:underline"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;