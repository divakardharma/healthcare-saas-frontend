import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useStaff from "../../modules/staff/hooks/useStaff";


const StaffPage = () => {
  const theme = useTheme();

  const {
    staff,
    loading,
    error,
    loadStaff,
    changeStaffRole,
    changeStaffStatus
  } = useStaff();

  const [roleChanges, setRoleChanges] = useState({});

  useEffect(() => {
    loadStaff();
  }, []);

  const handleRoleChange = (staffId, roleId) => {
    setRoleChanges((prev) => ({
      ...prev,
      [staffId]: roleId
    }));
  };

  const handleRoleUpdate = (member) => {
    const newRoleId = roleChanges[member.id];

    if (!newRoleId || Number(newRoleId) === Number(member.role_id)) {
      return;
    }

    changeStaffRole(
      member.id,
      member.user_id,
      Number(newRoleId),
      member.status
    );
  };

  const handleStatusChange = (member, status) => {
    if (status === member.status) {
      return;
    }

    changeStaffStatus(member.id, status);
  };

  const getRoleId = (member) => {
    if (roleChanges[member.id] !== undefined) {
      return roleChanges[member.id];
    }

    return member.role_id;
  };

  return (
    <DashboardLayout>
      <style>{`
        .staff-container {
          padding: 24px;
        }

        .staff-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .staff-title {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .staff-subtitle {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .staff-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .staff-section-title {
          margin: 0 0 18px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .staff-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .staff-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .staff-table th {
          text-align: left;
          padding: 14px 12px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
        }

        .staff-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 14px;
          vertical-align: middle;
        }

        .staff-table tbody tr:hover {
          background: #f9fafb;
        }

        .role-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-select,
        .status-select {
          min-width: 130px;
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }

.role-select:focus,
.status-select:focus {
  border-color: var(--primary-color);
}

.save-role-button {
  border: none;
  border-radius: 7px;
  padding: 8px 12px;
  background: var(--primary-color);
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

.save-role-button:hover {
  background: var(--primary-hover);
}

        .save-role-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .status-active {
          color: #166534;
          background: #dcfce7;
        }

        .status-inactive {
          color: #991b1b;
          background: #fee2e2;
        }

        .status-select {
          min-width: 110px;
          font-weight: 500;
        }

        .loading-message,
        .error-message,
        .empty-message {
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }

        .loading-message {
          color: #6b7280;
          background: #f9fafb;
        }

        .error-message {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .empty-message {
          color: #6b7280;
          background: #f9fafb;
        }

        .user-id {
          font-weight: 500;
          color: #374151;
        }

        @media (max-width: 900px) {
          .staff-container {
            padding: 18px;
          }

          .staff-title {
            font-size: 24px;
          }
        }

        @media (max-width: 600px) {
          .staff-container {
            padding: 16px;
          }

          .staff-section {
            padding: 16px;
          }

          .staff-header {
            align-items: flex-start;
          }
        }
      `}</style>

      <div
  className="staff-container"
  style={{
    "--primary-color": theme.colors.primary,
    "--primary-hover": theme.colors.primaryHover,
  }}
>
        <div className="staff-header">
          <div>
            <h1 className="staff-title">Staff Management</h1>
            <p className="staff-subtitle">
              Manage staff roles and account status
            </p>
          </div>
        </div>

        {loading && (
          <div className="loading-message">
            Loading staff...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="staff-section">
            <h2 className="staff-section-title">
              Staff Members
            </h2>

            {staff.length === 0 ? (
              <p className="empty-message">
                No staff members found.
              </p>
            ) : (
              <div className="staff-table-wrapper">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>User ID</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {staff.map((member) => {
                      const selectedRoleId = getRoleId(member);

                      return (
                        <tr key={member.id}>
                          <td>{member.id}</td>

                          <td>
                            <span className="user-id">
                              {member.user_id}
                            </span>
                          </td>

                          <td>
                            <div className="role-control">
                              <select
                                className="role-select"
                                value={selectedRoleId}
                                onChange={(event) =>
                                  handleRoleChange(
                                    member.id,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="2">
                                  Provider
                                </option>
                                <option value="3">
                                  Nurse
                                </option>
                                <option value="5">
                                  Pharmacist
                                </option>
                              </select>

                              <button
                                className="save-role-button"
                                onClick={() =>
                                  handleRoleUpdate(member)
                                }
                                disabled={
                                  Number(selectedRoleId) ===
                                  Number(member.role_id)
                                }
                              >
                                Save
                              </button>
                            </div>
                          </td>

                          <td>
                            <select
                              className={`status-select ${
                                member.status === "Active"
                                  ? "status-active"
                                  : "status-inactive"
                              }`}
                              value={member.status}
                              onChange={(event) =>
                                handleStatusChange(
                                  member,
                                  event.target.value
                                )
                              }
                            >
                              <option value="Active">
                                Active
                              </option>
                              <option value="Inactive">
                                Inactive
                              </option>
                            </select>
                          </td>

                          <td>
                            {member.created_at}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffPage;