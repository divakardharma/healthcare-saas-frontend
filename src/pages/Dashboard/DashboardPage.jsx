
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarDays,
  FileText,
  CreditCard,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowUpRight,
  Activity,
  ClipboardList,
  LogOut,
  Stethoscope,
} from "lucide-react";

import useAuth from "../../modules/auth/hooks/useAuth";
import { useDashboard } from "../../modules/dashboard/hooks/useDashboard";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common";

import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const { user, isAuthenticated, loading, logoutUser } = useAuth();

  const {
    data,
    loading: dashboardLoading,
    error,
    loadDashboard,
  } = useDashboard();

  const userRoles = user?.roles || [];
  const canViewDashboard =
    userRoles.includes("Admin") || userRoles.includes("Provider");

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && canViewDashboard) {
      loadDashboard();
    }
  }, [isAuthenticated, canViewDashboard]);

  if (loading) {
    return (
      <DashboardLayout>
        <main className="health-dashboard">
          <div className="hd-message">Checking your session...</div>
        </main>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return null;

  if (!canViewDashboard) {
    return (
      <DashboardLayout>
        <main className="health-dashboard">
          <section className="hd-welcome">
            <div className="hd-welcome-icon">
              <Stethoscope size={30} />
            </div>
            <h1>Welcome to Healthcare</h1>
            <p>
              Hello, {user?.name || user?.username || "User"}.
              Your healthcare portal is ready.
            </p>
            <Button onClick={logoutUser} disabled={loading}>
              <LogOut size={16} /> Logout
            </Button>
          </section>
        </main>
      </DashboardLayout>
    );
  }

  const dashboard = data?.data;
  const appointments = dashboard?.appointment_statistics || {};
  const prescriptions = dashboard?.prescription_summary || {};
  const recentAppointments = dashboard?.recent_appointments || [];

  const summaryCards = [
    {
      label: "Total Patients",
      value: dashboard?.total_patients ?? 0,
      icon: Users,
      color: "blue",
      note: "Registered patients",
    },
    {
      label: "Total Appointments",
      value: appointments.total ?? 0,
      icon: CalendarDays,
      color: "green",
      note: "All appointments",
    },
    {
      label: "Total Prescriptions",
      value: prescriptions.total ?? 0,
      icon: FileText,
      color: "purple",
      note: "Issued prescriptions",
    },
  ];

  const appointmentStats = [
    {
      label: "Scheduled",
      value: appointments.scheduled ?? 0,
      icon: Clock3,
      color: "blue",
    },
    {
      label: "Completed",
      value: appointments.completed ?? 0,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Cancelled",
      value: appointments.cancelled ?? 0,
      icon: XCircle,
      color: "red",
    },
    {
      label: "Total",
      value: appointments.total ?? 0,
      icon: CalendarCheck,
      color: "purple",
    },
  ];

  const prescriptionStats = [
    { label: "Pending", value: prescriptions.pending ?? 0, color: "orange" },
    { label: "Verified", value: prescriptions.verified ?? 0, color: "green" },
    { label: "Dispensed", value: prescriptions.dispensed ?? 0, color: "blue" },
    { label: "Cancelled", value: prescriptions.cancelled ?? 0, color: "red" },
  ];

  const maxAppointmentValue = Math.max(
    ...appointmentStats.map((item) => Number(item.value) || 0),
    1
  );

  const getAppointmentName = (item) =>
    item.patient_name || item.patient?.name || item.patient?.patient_name || item.name || "Patient";

const getAppointmentDate = (item) =>
  item.appointment_date
    ? `${item.appointment_date} ${item.appointment_time || ""}`.trim()
    : "—";

  const getAppointmentProvider = (item) =>
    item.provider_name || item.provider?.name || item.doctor_name || "—";

  const getAppointmentStatus = (item) =>
    item.status || "Scheduled";

  return (
    <DashboardLayout>
      <main className="health-dashboard">
        <header className="hd-header">
          <div>
            <div className="hd-eyebrow">
              <Activity size={15} />
              HEALTHCARE OVERVIEW
            </div>
            <h1>Dashboard</h1>
            <p>
              Welcome back,{" "}
              <strong>{user?.name || user?.username || "User"}</strong>.
              Here's your healthcare overview.
            </p>
          </div>

          <Button onClick={logoutUser} disabled={loading}>
            <LogOut size={16} />
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </header>

        {error && (
          <div className="hd-message hd-error" role="alert">
            {error}
          </div>
        )}

        {dashboardLoading && (
          <div className="hd-message">
            <span className="hd-spinner" />
            Loading dashboard data...
          </div>
        )}

        {!dashboardLoading && !error && dashboard && (
          <>
            <section className="hd-summary-grid">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="hd-summary-card" key={card.label}>
                    <div className={`hd-icon-box ${card.color}`}>
                      <Icon size={23} strokeWidth={2.1} />
                    </div>

                    <div className="hd-summary-content">
                      <p>{card.label}</p>
                      <h2>{card.value}</h2>
                      <span>{card.note}</span>
                    </div>

                    <ArrowUpRight
                      className="hd-card-arrow"
                      size={19}
                      aria-hidden="true"
                    />
                  </article>
                );
              })}
            </section>

            <section className="hd-main-grid">
              <article className="hd-panel">
                <div className="hd-panel-header">
                  <div className="hd-panel-title">
                    <span className="hd-panel-icon blue">
                      <CalendarCheck size={20} />
                    </span>
                    <div>
                      <h2>Appointment Statistics</h2>
                      <p>Overview by appointment status</p>
                    </div>
                  </div>
                </div>

                <div className="hd-chart">
                  {appointmentStats.map((item) => {
                    const Icon = item.icon;
                    const percentage =
                      (Number(item.value || 0) / maxAppointmentValue) * 100;

                    return (
                      <div className="hd-chart-row" key={item.label}>
                        <div className="hd-chart-label">
                          <span className={`hd-status-dot ${item.color}`} />
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>

                        <div
                          className="hd-progress-track"
                          role="img"
                          aria-label={`${item.label}: ${item.value}`}
                        >
                          <div
                            className={`hd-progress-fill ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="hd-panel">
                <div className="hd-panel-header">
                  <div className="hd-panel-title">
                    <span className="hd-panel-icon purple">
                      <ClipboardList size={20} />
                    </span>
                    <div>
                      <h2>Prescription Summary</h2>
                      <p>Current prescription status</p>
                    </div>
                  </div>
                </div>

                <div className="hd-prescription-total">
                  <div>
                    <span>Total Prescriptions</span>
                    <h3>{prescriptions.total ?? 0}</h3>
                  </div>
                  <div className="hd-prescription-icon">
                    <FileText size={25} />
                  </div>
                </div>

                <div className="hd-prescription-list">
                  {prescriptionStats.map((item) => (
                    <div className="hd-prescription-row" key={item.label}>
                      <span className={`hd-status-dot ${item.color}`} />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="hd-panel hd-recent-panel">
              <div className="hd-panel-header">
                <div className="hd-panel-title">
                  <span className="hd-panel-icon blue">
                    <CalendarDays size={20} />
                  </span>
                  <div>
                    <h2>Recent Appointments</h2>
                    <p>Latest appointments available in the system</p>
                  </div>
                </div>

                <span className="hd-record-count">
                  {recentAppointments.length} records
                </span>
              </div>

              {recentAppointments.length === 0 ? (
                <div className="hd-empty">
                  <CalendarDays size={30} />
                  <h3>No recent appointments</h3>
                  <p>Appointments will appear here when available.</p>
                </div>
              ) : (
                <div className="hd-table-wrap">
                  <table className="hd-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date &amp; Time</th>
                        <th>Provider</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map((item, index) => {
                        const status = getAppointmentStatus(item);
                        const normalizedStatus = status
                          .toLowerCase()
                          .replace(/\s+/g, "-");

                        return (
                          <tr key={item.id ?? item.appointment_id ?? index}>
                            <td>
                              <div className="hd-patient-cell">
                                <span className="hd-patient-avatar">
                                  {getAppointmentName(item)
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                                <strong>{getAppointmentName(item)}</strong>
                              </div>
                            </td>
                            <td>{getAppointmentDate(item)}</td>
                            <td>{getAppointmentProvider(item)}</td>
                            <td>
                              <span
                                className={`hd-badge ${normalizedStatus}`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {!dashboardLoading && !error && !dashboard && (
          <div className="hd-message">
            Dashboard data is not available right now.
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}

export default DashboardPage;