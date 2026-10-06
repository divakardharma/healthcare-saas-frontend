import { useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useNotifications from "../../modules/notifications/hooks/useNotifications";

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    error,
    loadNotifications
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <>
      <style>{`
        .notifications-page {
          padding: 30px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .notifications-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 600;
          color: #1f2937;
        }

        .notifications-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .notification-count {
          min-width: 80px;
          padding: 12px 18px;
          border-radius: 10px;
          background: #f3f6ff;
          color: #2563eb;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
        }

        .notification-count span {
          display: block;
          margin-top: 3px;
          font-size: 11px;
          font-weight: 500;
          color: #6b7280;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }

        .notification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        .notification-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .notification-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff7ed;
          color: #f97316;
          font-size: 20px;
          font-weight: 700;
        }

        .notification-title h3 {
          margin: 0 0 4px;
          color: #1f2937;
          font-size: 17px;
          font-weight: 600;
        }

        .notification-title span {
          color: #6b7280;
          font-size: 12px;
        }

        .notification-message {
          margin-bottom: 18px;
          color: #4b5563;
          font-size: 14px;
        }

        .appointment-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .appointment-detail {
          padding: 14px;
          border-radius: 8px;
          background: #f9fafb;
          border: 1px solid #f0f1f3;
        }

        .detail-label {
          display: block;
          margin-bottom: 6px;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .detail-value {
          color: #111827;
          font-size: 14px;
          font-weight: 600;
        }

        .notification-state {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .notification-loader {
          width: 28px;
          height: 28px;
          margin-bottom: 12px;
          border: 3px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: notification-spin 0.8s linear infinite;
        }

        .notification-state p {
          margin: 0;
          font-size: 14px;
        }

        .notification-empty {
          padding: 50px 25px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .empty-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #ecfdf5;
          color: #16a34a;
          font-size: 22px;
          font-weight: 700;
        }

        .notification-empty h3 {
          margin: 0 0 8px;
          color: #1f2937;
          font-size: 18px;
        }

        .notification-empty p {
          max-width: 450px;
          margin: 0 auto;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .notification-error {
          padding: 20px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
        }

        .notification-error h3 {
          margin: 0 0 6px;
          color: #b91c1c;
          font-size: 16px;
        }

        .notification-error p {
          margin: 0;
          color: #dc2626;
          font-size: 14px;
        }

        @keyframes notification-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .notifications-page {
            padding: 20px;
          }

          .notifications-header {
            align-items: flex-start;
          }

          .notifications-header h1 {
            font-size: 24px;
          }

          .notification-count {
            min-width: 65px;
            padding: 10px 12px;
          }

          .appointment-details {
            grid-template-columns: 1fr;
          }

          .notification-card {
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          .notifications-page {
            padding: 15px;
          }

          .notifications-header {
            flex-direction: column;
          }

          .notification-count {
            align-self: flex-start;
          }
        }
      `}</style>

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
                You don't have any upcoming scheduled appointments assigned
                to you.
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
    </>
  );
};

export default NotificationsPage;