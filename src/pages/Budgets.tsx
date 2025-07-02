import { useState, useEffect, /*useMemo*/ } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useBudgetStore } from '../stores/budgetStore';
import BudgetModal from '../components/budgets/BudgetModal';
import { formatCurrency } from '../utils/formatCurrency';
import { useTransactionStore } from '../stores/transactionStore';

//pulls functions and states from budget store 
const Budgets = () => {
  const { budgets, loading, fetchAndSyncFoodBudget, fetchBudgets, addBudget, updateBudget, deleteBudget } = useBudgetStore();
  //const {currentMonth, setCurrentMonth} = useBudgetStore();

  //sets and updates selected month
  const currentMonth = useBudgetStore(state => state.currentMonth)
  const setCurrentMonth = useBudgetStore(state => state.setCurrentMonth)

  //manage modal states and handles which budget to edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<typeof budgets[0] | null>(null);

  //gets the current user
  const { user } = useAuth();

  //retrieves user transactions using exported function from transaction store
  const {transactions} = useTransactionStore();
  //const memorizedTransactions = useMemo(() => transactions, [transactions]);

  const selectedMonth = format(currentMonth, 'yyyy-MM');
  //const monthName = format(currentMonth, 'MMMM yyyy');


  //fetch budgets and sync with transaction for current month. 
  useEffect(() => {
    if (!user || transactions.length) return;

    const runInitialLoad = async () => {
      console.log("fetching budgets and syncing food budgets with food transactions");
      try {
        await fetchBudgets(user.id, selectedMonth);
        await fetchAndSyncFoodBudget(user.id, transactions, currentMonth);
      } catch (error) {
        console.error("error during inital load", error);
      }
    };

    runInitialLoad();
  },[user, transactions, selectedMonth, currentMonth]);

  //use effect that updates food budget any time transactions or month changes. 
  useEffect(() => {
  if (!user || !transactions.length) return;

  console.log("🔄 Re-syncing Food budget’s moneySpent after transactions update.");
  fetchAndSyncFoodBudget(user.id, transactions, currentMonth);
}, [user, transactions, transactions.length, currentMonth]);

  


/*
   //fetch budgets
  useEffect(() => {
  if (!user) return;

    const timer = setTimeout(() => {
      fetchBudgets(user.id, selectedMonth);
    }, 100);

    return () => clearTimeout(timer);
}, [user, selectedMonth]);
  
  //Sync food budget with data from transactions
  useEffect(() => {
  if (!user || transactions.length === 0) { 
    console.log("waiting for transactions to load");
    return;
  }
  const timer = setTimeout(() => {
    fetchAndSyncFoodBudget(user.id, transactions, currentMonth);
  }, 100);

  return () => clearTimeout(timer);
}, [user, transactions, currentMonth]);

*/


 


{/*}
  if (loading) {
    return <div>Loading budgets...</div>;
  }

  if (budgets.length === 0) {
    return <div>no budgets found</div>
  }
*/}
  
  // Calculate totals and show planned vs spent money
  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.plannedBudget, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + budget.moneySpent, 0);

  //opens modal and handles editing. budget data is prefilled.
  const handleEdit = (budget: typeof budgets[0]) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  //confirm deleteion handler. popup that users most approve. 
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  //handles saving logic. If editing existing budget it updates it, if not creates a new one. 
  const handleSave = async (budgetData: {
    name: string;
    plannedBudget: number;
    moneySpent: number;
    month: string;
    is_recurring: boolean;
  }) => {
    if (!user) return;

    try {
      if (selectedBudget) {
        await updateBudget(selectedBudget.id, budgetData);
        console.log(budgets.find(b => b.id === selectedBudget.id));
      } else {
        await addBudget(budgetData, user.id);
      }

      //closes modal after completed actions. also checks for any errors.
      setIsModalOpen(false);
      setSelectedBudget(null);
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };
  
  //rendering of visualization in the UI.
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Budgets</h1>
          <p className="mt-1 text-sm text-gray-500">
            {format(currentMonth, 'MMMM')}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            className="btn btn-outline"
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
          >
            {/*buttons for changing months*/}
            Previous Month
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              console.log('Switching to:', newDate);
              setCurrentMonth(newDate);
            }}
          >
            Next Month
          </button>
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </button>
        </div>
      </div>
      
      {/* Budget summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Planned Budget</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(totalPlanned)}</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Money Spent</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(totalActual)}</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Difference</h3>
          <p className={`mt-2 text-2xl font-semibold ${totalPlanned - totalActual >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(Math.abs(totalPlanned - totalActual))}
            {totalPlanned - totalActual >= 0 ? ' under budget' : ' over budget'}
          </p>
        </div>
      </div>
      
      {/* Budget table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planned
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => {
                const difference = budget.plannedBudget - budget.moneySpent;
                const percentage = (budget.moneySpent / budget.plannedBudget) * 100;
                const isOverBudget = difference < 0;
                
                return (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(budget.plannedBudget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(budget.moneySpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${isOverBudget ? 'text-danger-600' : 'text-success-600'}`}>
                        {isOverBudget ? '-' : '+'} {formatCurrency(Math.abs(difference))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${isOverBudget ? 'bg-danger-600' : 'bg-success-600'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-danger-600 hover:text-danger-900"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/*loading*/}
      {loading && (
        <div className='absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center <-10 pointer-events-none'>
          <span className='text-gray-700 font-medium'>Loading...</span>
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        onSave={handleSave}
        budget={selectedBudget || undefined}
      />
    </div>
  );
};

export default Budgets;