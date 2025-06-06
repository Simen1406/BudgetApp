import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: {
    type: string;
    category: 'income' | 'expense';
    amount: number;
    date: Date;
    description: string;
  }) => void;
  transaction?: {
    type: string;
    category: 'income' | 'expense';
    amount: number;
    date: Date;
    description: string;
  };
  availableTypes: string[];
}

const TransactionModal = ({ isOpen, onClose, onSave, transaction, availableTypes }: TransactionModalProps) => {
  const [type, setType] = useState(transaction?.type || '');
  const [category, setCategory] = useState<'income' | 'expense'>(transaction?.category || 'expense');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [date, setDate] = useState(
    transaction?.date?.toISOString().split('T')[0] || 
    new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(transaction?.description || '');
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring || false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setCategory(transaction.category);
      setAmount(transaction.amount.toString());
      setDate(transaction.date.toISOString().split('T')[0]);
      setDescription(transaction.description || '');
      setIsRecurring(transaction.is_recurring || false);
    } else {
      setType('');
      setCategory('expense');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setIsRecurring(false);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      description,
      is_recurring: isRecurring
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/*choose category: income or expense*/}
          <div>
            <label className="form-label">Category</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={category === 'income'}
                  onChange={() => setCategory("income")}
                  className="mr-2"
                />
                Income
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={category === 'expense'}
                  onChange={() => setCategory("expense")}
                  className="mr-2"
                />
                Expense
              </label>
            </div>
          </div>
          
          {/*choose transaction type*/}
          <div>
            <label htmlFor="category" className="form-label">Transaction Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Select a Type</option>
              {availableTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            </select>
          </div>

          {/* choose amount */}
          <div>
            <label htmlFor="type" className="form-label">Amount</label>
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

          {/* date */}
          <div>
            <label htmlFor="date" className="form-label">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/*description*/}
          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
              Description
            </label>
            <input
            id='description'
            type='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            />
          </div>

          {/* Recurring transaction checkbox */}
          <div>
            <label className='inline-flex items-center'>
              <input
                type='checkbox'
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                className='mr-2'
                />
                Recurring transaction
            </label>
          </div>

          {/* actions */}
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

export default TransactionModal;