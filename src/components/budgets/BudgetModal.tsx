import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: {
    name: string;
    plannedBudget: number;
    moneySpent: number;
    month: string;
    is_recurring: boolean;
  }) => void;
  budget?: {
    name: string;
    plannedBudget: number;
    moneySpent: number;
    month: string;
    is_recurring: boolean;
  };
}

const categories = [
  'Housing',
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Healthcare',
  'Other'
];

const BudgetModal = ({ isOpen, onClose, onSave, budget }: BudgetModalProps) => {
  const [name, setName] = useState(budget?.name || '');
  const [plannedBudget, setPlannedBudget] = useState(budget?.plannedBudget?.toString() || '');
  const [moneySpent, setMoneySpent] = useState(budget?.moneySpent?.toString() || '0');
  const [month, setMonth] = useState(budget?.month || new Date().toISOString().slice(0, 7));
  const [isRecurring, setIsRecurring] = useState(budget?.is_recurring || false);

  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setPlannedBudget(budget.plannedBudget.toString());
      setMoneySpent(budget.moneySpent.toString());
      setMonth(budget.month);
      setIsRecurring(budget.is_recurring)
    }
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      plannedBudget: parseFloat(plannedBudget),
      moneySpent: parseFloat(moneySpent),
      month,
      is_recurring: isRecurring,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="form-label">Name</label>
            <select
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="plannedBudget" className="form-label">Planned Budget</label>
            <input
              id="plannedBudget"
              type="number"
              step="0.01"
              min="0"
              value={plannedBudget}
              onChange={(e) => setPlannedBudget(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="moneySpent" className="form-label">Money spent</label>
            <input
              id="moneySpent"
              type="number"
              step="0.01"
              min="0"
              value={moneySpent}
              onChange={(e) => setMoneySpent(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="month" className="form-label">Month</label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="fkex items-center space-x-2">
            <input
              id="isRecurring"
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              />
              <label htmlFor="isRecurring" className="form-label">
                Apply for every month (recurring)
              </label>
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

export default BudgetModal;