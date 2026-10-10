import { useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useNotifications from "../../modules/notifications/hooks/useNotifications";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Upcoming appointments assigned to you.</p>
          </div>

          <div className="notification-count">
            {notifications.length}
            <span>Upcoming</span>
          </div>
        </div>

        {loading && (
          <div className="notification-state">
            <div className="notification-loader"></div>
            <p>Loading notifications...</p>
          </div>
        )}

        {error && !loading && (
          <div className="notification-error">
            <h3>Unable to load notifications</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notification-empty">
            <div className="empty-icon">✓</div>
            <h3>No Upcoming Appointments</h3>
            <p>
              You don't have any upcoming scheduled appointments
              assigned to you.
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                className="notification-card"
                key={notification.appointment_id}
              >
                <div className="notification-card-top">
                  <div className="notification-icon">!</div>

                  <div className="notification-title">
                    <h3>Upcoming Appointment</h3>
                    <span>Scheduled appointment</span>
                  </div>
                </div>

                <div className="notification-message">
                  You have an appointment scheduled for:
                </div>

                <div className="appointment-details">
                  <div className="appointment-detail">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {notification.appointment_date}
                    </span>
                  </div>

                  <div className="appointment-detail">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">
                      {notification.appointment_time}
                    </span>
                  </div>

                  <div className="appointment-detail">
                    <span className="detail-label">Appointment ID</span>
                    <span className="detail-value">
                      #{notification.appointment_id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;

