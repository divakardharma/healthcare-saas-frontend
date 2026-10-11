import { Navigate } from "react-router-dom";
import useAuth from "../modules/auth/hooks/useAuth";
import { Loader } from "../components/common";


function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

 const userRoles = user?.roles || [];

if (
  allowedRoles.length > 0 &&
  !allowedRoles.some((role) => userRoles.includes(role))
) {
  return <Navigate to="/dashboard" replace />;
}
  return children;
}

export default RoleBasedRoute;