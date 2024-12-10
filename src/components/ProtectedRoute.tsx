import { isAuthenticated } from '@/data/model/userAccount';
import { LOGIN_PATH } from '@/data/route';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: JSX.Element;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = LOGIN_PATH,
}) => {
  return isAuthenticated() ? element : <Navigate to={redirectTo} />;
};

export default ProtectedRoute;
