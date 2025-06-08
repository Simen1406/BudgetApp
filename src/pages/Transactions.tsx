import { useState, useRef, useEffect } from 'react';
import { Plus, Filter, Download, Upload, Search, Edit2, Trash2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useTransactionStore } from '../stores/transactionStore';
import { exportTransactionsToCSV } from '../utils/csvUtils';
import TransactionModal from '../components/transactions/TransactionModal';
import { formatCurrency } from '../utils/formatCurrency';
import { supabase } from '../lib/supabase';
import { insertTransactionsForUser } from '../lib/supabaseTransactions';
import { Transaction, defaultTransactionTypes } from '../types/transactionsType';
import { mockTransactionTypes } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { calculateTransactionTotals } from '../utils/transactionCalculator';
import { merge } from 'chart.js/helpers';




const Transactions = () => {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const { isGuest } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedMonth = format (currentMonth, 'yyyy-MM');
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  
  useEffect(() => {
    const fetchTransactionTypes = async () => {
      if (isGuest) {
        setAvailableTypes(mockTransactionTypes);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/transaction-type");
        const data = await res.json();

        if (Array.isArray(data)) {
          const mergedTypes = Array.from(new Set([...defaultTransactionTypes, ...data]));
          setAvailableTypes(mergedTypes);
        }
      } catch (err) {
        console.error("Error fetching transaction types:", err);
      }
    };

    fetchTransactionTypes();
  }, []);
  
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === 'all' || transaction.category === filterType;
    
    const transactionMonth = format(new Date(transaction.date), 'yyyy-MM');
    const matchesMonth = transactionMonth === selectedMonth;

    const isVisible = transaction.is_recurring === true || matchesMonth;

    return matchesSearch && matchesType && isVisible;
      
    return matchesSearch && matchesType && matchesMonth;
  });

  const { totalIncome, totalExpenses, netTotal, incomeCount, expenseCount } = calculateTransactionTotals(transactions, selectedMonth);

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions);
  };

  const handleRawCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    // Upload CSV to FastAPI backend
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/clean-csv`, {
      method: "POST",
      body: formData,
    });

    const cleaned = await response.json();

    if (!Array.isArray(cleaned)) {
      console.error("❌ CSV API error response:", cleaned);
      throw new Error("CSV parsing failed or returned wrong format");
    }

    const cleanedWithDates = cleaned.map((t) => ({
      ...t,
      date: new Date(t.date),
    }));
    

    // Get Supabase session and user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error("Not authenticated");
    }

    const user = session.user;

    // Insert cleaned data with user_id
    const inserted = await insertTransactionsForUser(user.id, cleanedWithDates);

    if (!inserted) {
      throw new Error("Failed to insert transactions to Supabase");
    }

    // Update Zustand store immediately
    const { transactions, setTransactions } = useTransactionStore.getState();
    setTransactions([...transactions, ...inserted]);

    alert(`✅ Successfully imported ${inserted.length} transactions`);
  } catch (error) {
    console.error("❌ import failed", error);
    alert('Error importing transactions: ' + (error as Error).message);
  }

  // Reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  const handleSaveRecurringTransaction = (TransactionData) => {
    addTransaction({...TransactionData, is_recurring: true });
    setIsRecurringModalOpen(false);
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
        <div className="mt-4 sm:mt-0 flex items-center justify-end space-x-2">
          {/*month navigation buttons*/}
           <button
              className="btn btn-outline"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              }}
            >
              Previous
            </button>
            <span className="text-gray-600 font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              }}
            >
              Next
            </button>

            {/* Spacing */}
            <div className="ml-4"></div>
              <button 
                className="btn btn-primary flex items-center"
                onClick={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
              >
                {/*transaction button*/}
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
              
              <div className='relative group'>
                <button
                  className='btn btn-primary flex items-center'
                  onClick={() => {setIsRecurringModalOpen(true)
                  //open recurring transaction modal
                  }}
                >
                  Add recurring transaction
                </button>

                <div
                  className='absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
                            opacity-0 group-hover:opacity-100
                            bg-gray-800 text-white text-xs rounded py-1 px-3
                            whitespace-nowrap pointer-events-none
                            transition-opacity duration-300 z-50'
                >
                  Use this for adding your monthly transactions like loan payments and utilities.
                </div>
              </div>
            </div>

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
      
      {/* 🟡 Standalone Totals Container */}
    <div className="bg-white shadow-sm rounded-lg p-4 my-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">Summary for {format(currentMonth, 'MMMM yyyy')}</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600">Total Income:</p>
          <p className="text-green-600 font-bold">{totalIncome.toFixed(1)}</p>
          <p className="text-xs text-gray-500">{incomeCount} {incomeCount === 1 ? 'income transaction' : 'income transactions'}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">Total Expense:</p>
          <p className="text-red-600 font-bold">{totalExpenses.toFixed(1)}</p>
          <p className="text-xs text-gray-500">{expenseCount} {expenseCount === 1 ? 'expense transaction' : 'expense transactions'}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">Net Total:</p>
          <p className={netTotal >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {netTotal.toFixed(1)}
          </p>
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
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right'>
                      {transaction.description || '-'}
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

      <TransactionModal
        isOpen = {isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSave = {handleSaveRecurringTransaction}
        availableTypes={availableTypes}
      />
    </div>
  );
};

export default Transactions;