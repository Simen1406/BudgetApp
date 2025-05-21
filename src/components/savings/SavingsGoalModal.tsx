import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: {
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: Date;
  }) => void;
  goal?: {
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: Date;
  };
}

const SavingsGoalModal = ({ isOpen, onClose, onSave, goal }: SavingsGoalModalProps) => {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [savedAmount, setSavedAmount] = useState(goal?.savedAmount?.toString() || '0');
  const [deadline, setDeadline] = useState(
    goal?.deadline?.toISOString().split('T')[0] || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setSavedAmount(goal.savedAmount.toString());
      setDeadline(goal.deadline.toISOString().split('T')[0]);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount),
      deadline: new Date(deadline),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {goal ? 'Edit Savings Goal' : 'Add Savings Goal'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="form-label">Goal Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="targetAmount" className="form-label">Target Amount</label>
            <input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="savedAmount" className="form-label">Initial Saved Amount</label>
            <input
              id="savedAmount"
              type="number"
              step="0.01"
              min="0"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="deadline" className="form-label">Target Date</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoalModal;