import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: {
    category: string;
    plannedAmount: number;
    actualAmount: number;
    month: Date;
  }) => void;
  budget?: {
    category: string;
    plannedAmount: number;
    actualAmount: number;
    month: Date;
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
  const [category, setCategory] = useState(budget?.category || '');
  const [plannedAmount, setPlannedAmount] = useState(budget?.plannedAmount?.toString() || '');
  const [actualAmount, setActualAmount] = useState(budget?.actualAmount?.toString() || '0');
  const [month, setMonth] = useState(
    budget?.month?.toISOString().split('T')[0].slice(0, 7) || 
    new Date().toISOString().split('T')[0].slice(0, 7)
  );

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setPlannedAmount(budget.plannedAmount.toString());
      setActualAmount(budget.actualAmount.toString());
      setMonth(budget.month.toISOString().split('T')[0].slice(0, 7));
    }
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      category,
      plannedAmount: parseFloat(plannedAmount),
      actualAmount: parseFloat(actualAmount),
      month: new Date(month + '-01'),
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
            <label htmlFor="category" className="form-label">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label htmlFor="plannedAmount" className="form-label">Planned Amount</label>
            <input
              id="plannedAmount"
              type="number"
              step="0.01"
              min="0"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="actualAmount" className="form-label">Actual Amount</label>
            <input
              id="actualAmount"
              type="number"
              step="0.01"
              min="0"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
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