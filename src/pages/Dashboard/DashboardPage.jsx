import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../modules/auth/hooks/useAuth";

function DashboardPage() {
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loading,
    logoutUser,
  } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Login successful.</p>

      <button
        onClick={logoutUser}
        disabled={loading}
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}

export default DashboardPage;