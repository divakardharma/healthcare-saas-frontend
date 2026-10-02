import { Navigate } from "react-router-dom";
import useAuth from "../modules/auth/hooks/useAuth";
import { Loader } from "../components/common";

function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;