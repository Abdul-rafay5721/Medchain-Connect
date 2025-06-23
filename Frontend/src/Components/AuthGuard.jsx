import { Navigate } from 'react-router-dom';
import { getUserSession } from '../utils/sessionManager';

const AuthGuard = ({ children, allowedRole }) => {
  const session = getUserSession();

  if (!session || !session.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && session.role !== allowedRole) {
    const redirectPath = session.role === 'patient' ? '/patient-dashboard' : '/provider-dashboard';
    return <Navigate to={redirectPath} />;
  }

  return children;
};

export default AuthGuard;
