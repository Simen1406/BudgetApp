import { useState, useRef, useEffect } from 'react';
import { Plus, Filter, Download, Upload, Search, Edit2, Trash2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useTransactionStore } from '../stores/transactionStore';
import { exportTransactionsToCSV } from '../utils/csvUtils';
import TransactionModal from '../components/transactions/TransactionModal';
import type { Transaction } from '../components/dashboard/RecentTransactions';
import { formatCurrency } from '../utils/formatCurrency';
import { supabase } from '../lib/supabase';



const Transactions = () => {
  const { transactions, addTransaction, addTransactions, deleteTransaction, updateTransaction } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchTransactionTypes = async () => {
      try {
        const res = await fetch("http://localhost:8000/transaction-type");
        const data = await res.json();

        if (Array.isArray(data)) {
          console.log("Fetched available types:", data);
          setAvailableTypes(data);
        }
      } catch (err) {
        console.error("Error fetching transaction types:", err);
      }
    };

    fetchTransactionTypes();
  }, []);
  
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.note?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = 
      filterType === 'all' || transaction.type === filterType;
      
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions);
  };

  const handleRawCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      //upload csv file to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch("http://localhost:8000/clean-csv", {
        method: "POST",
        body: formData,
        });

      const cleaned = await response.json();

      if(!Array.isArray(cleaned)) {
        console.error("❌ CSV API error response:", cleaned);
        throw new Error("Not authenticated");
      }

      //Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("🧪 Supabase session result:", session);
      console.log("🧪 Supabase session error:", sessionError);

      const userCheck = await supabase.auth.getUser();
      console.log("🧪 Supabase user result:", userCheck);



      if (sessionError || !session || !session.user) {
        throw new Error("Not authenticated");
}

      const user = session.user;

      //send the cleaned data to supabase
      await addTransactions(cleaned, user.id);
      alert(`Successfully imported ${cleaned.length} cleaned transactions`);
    } catch (error) {
      console.error("import failed", error)
      alert('Error importing transactions: ' + (error as Error).message);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleSave = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const formatDate = (date: Date) => {
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid Date';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="mt-4 sm:mt-0">
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  filterType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('income')}
                className={`px-4 py-2 text-sm font-medium ${
                  filterType === 'income'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-300`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFilterType('expense')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  filterType === 'expense'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                Expenses
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button className="btn btn-outline flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
              <button 
                className="btn btn-outline flex items-center"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button 
                className="btn btn-outline flex items-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Raw CSV
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleRawCsvImport}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${
                        transaction.category === 'income' ? 'bg-success-500' : 'bg-danger-500'
                      } mr-2`}></div>
                      <span className="text-sm font-medium text-gray-900">{transaction.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      transaction.category === 'income' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {transaction.category === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-danger-600 hover:text-danger-900"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        transaction={editingTransaction || undefined}
        availableTypes={availableTypes}
      />
    </div>
  );
};

export default Transactions;