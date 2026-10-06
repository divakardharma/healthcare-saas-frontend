import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../../modules/auth/hooks/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common";
import { useDashboard } from "../../modules/dashboard/hooks/useDashboard";

function DashboardPage() {
  const navigate = useNavigate();
const { user, isAuthenticated, loading, logoutUser } = useAuth();
  const {
    data,
    loading: dashboardLoading,
    error,
    loadDashboard
  } = useDashboard();
// console.log("Dashboard data:", data); // Log the dashboard data for debugging
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

const userRoles = user?.roles || [];

const canViewDashboard = userRoles.includes("Admin") ||
  userRoles.includes("Provider");

useEffect(() => {
  if (isAuthenticated && canViewDashboard) {
    loadDashboard();
  }
}, [isAuthenticated, canViewDashboard]);

  const dashboardData = data?.data;

if (!canViewDashboard) {
  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <div className="welcome-card">
          <h1>Welcome to Healthcare </h1>
          <p>
            Welcome, {user?.name || user?.username || "User"}.
          </p>
           <Button onClick={logoutUser} disabled={loading}>
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
  return (
    <DashboardLayout>
      <style>{`
        .dashboard-container {
          padding: 24px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          gap: 20px;
        }

        .dashboard-title {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .dashboard-subtitle {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .dashboard-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .card-label {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .card-value {
          color: #111827;
          font-size: 30px;
          font-weight: 700;
          margin: 0;
        }

        .dashboard-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .section-title {
          margin: 0 0 18px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .stat-box {
          background: #f9fafb;
          border-radius: 10px;
          padding: 16px;
        }

        .stat-label {
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .stat-value {
          color: #111827;
          font-size: 22px;
          font-weight: 600;
          margin: 0;
        }

        .loading-message,
        .error-message {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .error-message {
          color: #b91c1c;
          background: #fef2f2;
          border-color: #fecaca;
        }

        .empty-message {
          color: #6b7280;
          text-align: center;
          padding: 25px 10px;
          margin: 0;
        }

        @media (max-width: 900px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .dashboard-container {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Overview of your healthcare system
            </p>
          </div>

          <Button onClick={logoutUser} disabled={loading}>
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </div>

        {dashboardLoading && (
          <div className="loading-message">
            Loading dashboard data...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {dashboardData && (
          <>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-label">Total Patients</div>
                <p className="card-value">
                  {dashboardData.total_patients}
                </p>
              </div>

              <div className="dashboard-card">
                <div className="card-label">Total Appointments</div>
                <p className="card-value">
                  {dashboardData.appointment_statistics.total}
                </p>
              </div>

              <div className="dashboard-card">
                <div className="card-label">Total Prescriptions</div>
                <p className="card-value">
                  {dashboardData.prescription_summary.total}
                </p>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">
                Appointment Statistics
              </h2>

              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Scheduled</div>
                  <p className="stat-value">
                    {dashboardData.appointment_statistics.scheduled}
                  </p>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Completed</div>
                  <p className="stat-value">
                    {dashboardData.appointment_statistics.completed}
                  </p>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Cancelled</div>
                  <p className="stat-value">
                    {dashboardData.appointment_statistics.cancelled}
                  </p>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Total</div>
                  <p className="stat-value">
                    {dashboardData.appointment_statistics.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">
                Prescription Summary
              </h2>

              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Pending</div>
                  <p className="stat-value">
                    {dashboardData.prescription_summary.pending}
                  </p>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Verified</div>
                  <p className="stat-value">
                    {dashboardData.prescription_summary.verified}
                  </p>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Dispensed</div>
                  <p className="stat-value">
                    {dashboardData.prescription_summary.dispensed}
                  </p>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Cancelled</div>
                  <p className="stat-value">
                    {dashboardData.prescription_summary.cancelled}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">
                Recent Appointments
              </h2>

              {dashboardData.recent_appointments.length === 0 ? (
                <p className="empty-message">
                  No recent appointments found.
                </p>
              ) : (
                <p>
                  Recent appointments available:{" "}
                  {dashboardData.recent_appointments.length}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;