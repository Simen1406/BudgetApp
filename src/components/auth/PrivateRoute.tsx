import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../ui/LoadingScreen';

//Ensures that access is restriced to users. non-authenticated users are sent to login. 

const PrivateRoute = () => {
  //get auth state.
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  //if user is authenticated or guest allow access if not send to login.
  return (user || isGuest) ? <Outlet /> : <Navigate to="/login" />;
};

//export component to be used elsewhere
export default PrivateRoute;