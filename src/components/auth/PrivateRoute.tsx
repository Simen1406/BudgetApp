import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../ui/LoadingScreen';

const PrivateRoute = () => {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (user || isGuest) ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;