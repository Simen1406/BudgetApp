import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import SavingsGoals from './pages/SavingsGoals';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import { useSavingsStore } from './stores/savingsStore';
import { useTransactionStore } from './stores/transactionStore';
import { useBudgetStore } from './stores/budgetStore';
import { mockBudget, mockTransactions, mockGoal } from './data/mockData';


function App() {
  const { user, isGuest, isLoading } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const { fetchGoals } = useSavingsStore();
  const { fetchTransactions } = useTransactionStore();

  const loadInitialData = (user: any, isGuest: boolean) => {
    const transactionStore = useTransactionStore.getState();
    const budgetStore = useBudgetStore.getState();
    const savingsStore = useSavingsStore.getState();

    //clear old data
    transactionStore.setTransactions([]);
    budgetStore.setBudgets([]);
    savingsStore.setGoals([]);

    if (isGuest) {
      //mock data
      transactionStore.setTransactions(mockTransactions);
      budgetStore.setBudgets([mockBudget]);
      savingsStore.setGoals([mockGoal]);
      return;
    }

    if (user) {
      //fetch user data
      const currentMonth = new Date().toISOString().slice(0,7);
      transactionStore.fetchTransactions(user.id);
      budgetStore.fetchBudgets(user.id, currentMonth);
      savingsStore.fetchGoals(user.id);
    }
  };

  useEffect(() => {
  // Simulate initial app loading
  const timer = setTimeout(() => {
    setAppReady(true);
  }, 1000);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
  if (appReady) {
    loadInitialData(user, isGuest);
  }
}, [user, appReady, isGuest]);

  
  return (
  <>

    <Toaster position="top-right" />

    <Routes>
      {/* Public routes */}
      <Route path="/login" element={(user || isGuest) ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={(user || isGuest) ? <Navigate to="/dashboard" /> : <Register />} />
      
      {/* Private routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/savings" element={<SavingsGoals />} />
        </Route>
      </Route>
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to={(user || isGuest) ? "/dashboard" : "/login"} />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
  );
}

export default App;