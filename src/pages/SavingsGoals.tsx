import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useSavingsStore } from '../stores/savingsStore';
import SavingsGoalModal from '../components/savings/SavingsGoalModal';
import AddFundsModal from '../components/savings/AddFundsModal';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';
import { toast} from "react-hot-toast"

//component that handles states and logic
const SavingsGoals = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addFunds } = useSavingsStore();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
  const { user } = useAuth();
  
  
  // Sort goals based on which goal is closest to being reached. 
  const sortedGoals = [...goals].sort((a, b) => {
    const progressA = (a.savedAmount / a.targetAmount) * 100;
    const progressB = (b.savedAmount / b.targetAmount) * 100;
    return progressB - progressA;
    });
  
  // Calculate total savings and totalt target savings.
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  //shows how far along user is for completing saving goals in %
  const overallProgress = (totalSaved / totalTarget) * 100;

  //handles edits of existing saving goals and at the moment also adding new ones. this should be changed in the future
  const handleEdit = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  //handles the adding of funds to existing goals
  const handleAddFunds = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setIsAddFundsModalOpen(true);
  };

  //handler for deleteion with a popup that requires users to authorize deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      deleteGoal(id)
      .then(() => toast.success("deleted savings goal."))
      .catch(() => toast.error("failed to delete savings goal."));
    }
  };

  //handles the saving of goals and checks if goal already exist before saving, if that happens an error will pop up in the UI -> handles no duplicates. 
  const handleSaveGoal = (goalData: {
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: Date;
    }) => {

    //Check if saving goal with same name/id exist and if it appears display error message in the UI
    const nameExists = goals.some(g => g.name.toLocaleLowerCase() === goalData.name.toLocaleLowerCase());

    if (!selectedGoal && nameExists) {
      toast.error("Goal with this name already exists.");
      return;
    }

    if (selectedGoal) {
      updateGoal(selectedGoal.id, goalData)
      .then(() => toast.success("Goal updatet successfully."))
      .catch(() => toast.error("Failed to updated goal"));
    } else {
      if (user?.id) {
        


        addGoal(goalData, user.id)
        .then(() => toast.success("New goal added."))
        .catch(() => toast.error("failed to add goal."));
      } else {
        console.error("No user ID found. Cannot save savings goal")
      }
    }
  };

  const handleAddFundsSave = (amount: number) => {
    if (selectedGoal) {
      addFunds(selectedGoal.id, amount)
      .then(() => toast.success("added funds successfully."))
      .catch(() => toast.error("failed to add funds."));
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <div className="mt-4 sm:mt-0">
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => {
              setSelectedGoal(null);
              setIsGoalModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Goal
          </button>
        </div>
      </div>
      
      {/* Summary card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
            <p className="mt-1 text-sm text-gray-500">
              Saved {formatCurrency(totalSaved)} of {formatCurrency(totalTarget)}
            </p>
          </div> 
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Total progress</span>
            <span className="font-medium text-gray-900">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary-600 rounded-full"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Goals grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedGoals.map((goal) => {
          const progress = (goal.savedAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.savedAmount;
          const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={goal.id} className="card hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{goal.name}</h3>
                  <p className="text-gray-500 text-sm">
                    Deadline: {format(goal.deadline, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="rounded-full bg-secondary-100 p-2">
                  <Target className="h-5 w-5 text-secondary-600" />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Saved</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(goal.savedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(remaining)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days Left</p>
                    <p className="text-lg font-semibold text-gray-900">{daysLeft}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-outline flex items-center justify-center py-1 px-3"
                    onClick={() => handleEdit(goal)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger flex items-center justify-center py-1 px-3"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
                <button 
                  className="btn btn-success flex items-center justify-center py-1 px-3"
                  onClick={() => handleAddFunds(goal)}
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Add Funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={handleSaveGoal}
        goal={selectedGoal || undefined}
      />

      <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onClose={() => {
          setIsAddFundsModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={handleAddFundsSave}
        goalName={selectedGoal?.name || ''}
      />
    </div>
  );
};

export default SavingsGoals;