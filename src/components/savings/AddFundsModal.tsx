import { useState } from 'react';
import { X } from 'lucide-react';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  goalName: string;
}

const AddFundsModal = ({ isOpen, onClose, onSave, goalName }: AddFundsModalProps) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(parseFloat(amount));
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Funds to {goalName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="form-label">Amount to Add</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsModal;