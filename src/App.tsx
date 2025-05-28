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
import { mockBudget, mockGoal, mockTransactions } from './data/mockData';

function App() {
  const { user, isGuest, isLoading } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const { fetchGoals } = useSavingsStore();
  const { fetchTransactions } = useTransactionStore();

  useEffect(() => {
  // Simulate initial app loading
  const timer = setTimeout(() => {
    setAppReady(true);
  }, 1000);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
    const transactionStore = useTransactionStore.getState();
    const savingsStore = useSavingsStore.getState();
    const budgetStore = useBudgetStore.getState();


    if (user && appReady && !isGuest) {
      console.log("logged into:", user.id);
      savingsStore.fetchGoals(user.id);
      transactionStore.fetchTransactions(user.id);
      budgetStore.fetchBudgets(user.id);
      
    }

    if (appReady && isGuest) {
      transactionStore.setTransactions(mockTransactions);
      savingsStore.setGoals([mockGoal]);
      budgetStore.setBudgets([mockBudget]);
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