import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../modules/auth/hooks/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common";

function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logoutUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <DashboardLayout>
      <div>
        <h1>Dashboard</h1>
        <p>Login successful.</p>

        <Button onClick={logoutUser} disabled={loading}>
        {loading ? "Logging out..." : "Logout"}
        </Button>



      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;