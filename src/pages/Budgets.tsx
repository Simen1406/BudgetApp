import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useBudgetStore } from '../stores/budgetStore';
import BudgetModal from '../components/budgets/BudgetModal';

const Budgets = () => {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgetStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<typeof budgets[0] | null>(null);
  
  const monthName = format(currentMonth, 'MMMM yyyy');
  
  // Calculate totals
  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.plannedAmount, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + budget.actualAmount, 0);

  const handleEdit = (budget: typeof budgets[0]) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  const handleSave = (budgetData: Omit<typeof budgets[0], 'id'>) => {
    if (selectedBudget) {
      updateBudget(selectedBudget.id, budgetData);
    } else {
      addBudget(budgetData);
    }
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Budgets</h1>
          <p className="mt-1 text-sm text-gray-500">{monthName}</p>
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
            Previous Month
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
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
          <p className="mt-2 text-2xl font-semibold text-gray-900">${totalPlanned.toFixed(2)}</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Actual Spending</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">${totalActual.toFixed(2)}</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Difference</h3>
          <p className={`mt-2 text-2xl font-semibold ${totalPlanned - totalActual >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            ${Math.abs(totalPlanned - totalActual).toFixed(2)}
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
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planned
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
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
                const difference = budget.plannedAmount - budget.actualAmount;
                const percentage = (budget.actualAmount / budget.plannedAmount) * 100;
                const isOverBudget = difference < 0;
                
                return (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${budget.plannedAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${budget.actualAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-danger-600' : 'text-success-600'
                      }`}>
                        {isOverBudget ? '-' : '+'} ${Math.abs(difference).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            isOverBudget ? 'bg-danger-600' : 'bg-success-600'
                          }`}
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