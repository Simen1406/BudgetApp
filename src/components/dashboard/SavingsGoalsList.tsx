import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
}

const mockGoals: SavingsGoal[] = [
  {
    id: '1',
    name: 'Vacation Fund',
    targetAmount: 2000,
    savedAmount: 800,
    deadline: new Date(2024, 11, 31),
  },
  {
    id: '2',
    name: 'Emergency Fund',
    targetAmount: 10000,
    savedAmount: 3500,
    deadline: new Date(2025, 5, 30),
  },
  {
    id: '3',
    name: 'New Laptop',
    targetAmount: 1500,
    savedAmount: 900,
    deadline: new Date(2024, 8, 15),
  },
];

const SavingsGoalsList = () => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Savings Goals</h2>
        <Link to="/savings" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {mockGoals.map((goal) => {
          const progress = (goal.savedAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.savedAmount;
          
          return (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <h3 className="font-medium text-gray-900">{goal.name}</h3>
              
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
              </div>
              
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-500 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Saved</span>
                <span className="font-medium text-gray-900">{formatCurrency(goal.savedAmount)}</span>
              </div>
              
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">Target</span>
                <span className="font-medium text-gray-900">{formatCurrency(goal.targetAmount)}</span>
              </div>
              
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className="font-medium text-gray-900">{formatCurrency(remaining)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoalsList;