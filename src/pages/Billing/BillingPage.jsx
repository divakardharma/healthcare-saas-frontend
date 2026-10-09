import { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../modules/auth/hooks/useAuth";
import useBilling from "../../modules/billing/hooks/useBilling";
import {
  getPatientsForBilling,
  getAppointmentsForBilling
} from "../../modules/billing/billingAPI";

const BillingPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
const [patients, setPatients] = useState([]);
const [appointments, setAppointments] = useState([]);
  const {
    billing,
    summary,
    loading,
    error,
    loadBilling,
    loadPaymentSummary,
    addBilling,
    editBilling,
    removeBilling,
    changePaymentStatus
  } = useBilling();

  const [showForm, setShowForm] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_id: "",
    amount: ""
  });

  const userRoles = user?.roles || [];

  const isAdmin = userRoles.includes("Admin");
  const isProvider = userRoles.includes("Provider");
  const isNurse = userRoles.includes("Nurse");

  const canManageBilling = isAdmin || isProvider;
  const canViewBilling = isAdmin || isProvider || isNurse;

 useEffect(() => {
  if (canViewBilling) {
    loadBilling();
    loadPaymentSummary();
  }

  if (canManageBilling) {
    const loadBillingOptions = async () => {
      try {
        const [patientResponse, appointmentResponse] =
          await Promise.all([
            getPatientsForBilling(),
            getAppointmentsForBilling()
          ]);

        setPatients(patientResponse.data || []);
        setAppointments(appointmentResponse.data || []);
      } catch (error) {
        console.error("Failed to load billing options", error);
      }
    };

    loadBillingOptions();
  }
}, [canViewBilling, canManageBilling]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      appointment_id: "",
      amount: ""
    });

    setEditingBilling(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      patient_id: Number(formData.patient_id),
      appointment_id: Number(formData.appointment_id),
      amount: Number(formData.amount)
    };

    if (editingBilling) {
      editBilling(editingBilling.id, {
        ...data,
        invoice_number: editingBilling.invoice_number,
        payment_status: editingBilling.payment_status
      });
    } else {
      addBilling(data);
    }

    resetForm();

    // setTimeout(() => {
    //   loadBilling();
    //   loadPaymentSummary();
    // }, 500);
  };

  const handleEdit = (invoice) => {
    setEditingBilling(invoice);

    setFormData({
      patient_id: invoice.patient_id || "",
      appointment_id: invoice.appointment_id || "",
      amount: invoice.amount || ""
    });

    setShowForm(true);
  };

  const handleDelete = (billingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) return;

    removeBilling(billingId);

    // setTimeout(() => {
    //   loadBilling();
    //   loadPaymentSummary();
    // }, 500);
  };

  const handleStatusChange = (billingId, status) => {
    changePaymentStatus(billingId, status);

    // setTimeout(() => {
    //   loadBilling();
    //   loadPaymentSummary();
    // }, 500);
  };

  if (!canViewBilling) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <h3>Access Denied</h3>
          <p>You do not have permission to view billing.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
  className="billing-page"
  style={{
    "--primary-color": theme.colors.primary,
    "--primary-hover": theme.colors.primaryHover
  }}
>
        <div className="billing-header">
          <div>
            <h2>Billing & Payment</h2>
            <p>Manage invoices and payment status</p>
          </div>

          {canManageBilling && (
            <button
              className="billing-primary-button"
              onClick={() => setShowForm(true)}
            >
              Create Invoice
            </button>
          )}
        </div>

        {error && (
          <div className="billing-error">
            {error}
          </div>
        )}

        <div className="billing-summary">
          <div className="billing-card">
            <span>Total Invoices</span>
            <strong>{summary?.total_invoices || 0}</strong>
          </div>

          <div className="billing-card">
            <span>Total Amount</span>
            <strong>
              ₹{Number(summary?.total_amount || 0).toFixed(2)}
            </strong>
          </div>

          <div className="billing-card">
            <span>Paid Amount</span>
            <strong>
              ₹{Number(summary?.paid_amount || 0).toFixed(2)}
            </strong>
          </div>

          <div className="billing-card">
            <span>Pending Amount</span>
            <strong>
              ₹{Number(summary?.pending_amount || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        {showForm && canManageBilling && (
          <div className="billing-form-card">
            <div className="billing-form-header">
              <h3>
                {editingBilling
                  ? "Edit Invoice"
                  : "Create Invoice"}
              </h3>

              <button
                className="billing-close-button"
                onClick={resetForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="billing-form-grid">
                <div className="billing-field">
                  <label>Patient ID</label>
                  <select
  className="form-input"
  name="patient_id"
  value={formData.patient_id}
  onChange={handleChange}
  required
>
  <option value="">Select Patient</option>
  {patients.map((patient) => (
    <option key={patient.id} value={patient.id}>
      {patient.id} - {patient.full_name}
    </option>
  ))}
</select>
                </div>

                <div className="billing-field">
                  <label>Appointment ID</label>
<select
  className="form-input"
  name="appointment_id"
  value={formData.appointment_id}
  onChange={handleChange}
  required
>
  <option value="">Select Appointment</option>
  {appointments.map((appointment) => (
    <option key={appointment.id} value={appointment.id}>
      Appointment #{appointment.id} - Patient #{appointment.patient_id}
    </option>
  ))}
</select>
                </div>

                <div className="billing-field">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="billing-form-actions">
                <button
                  type="button"
                  className="billing-secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="billing-primary-button"
                  disabled={loading}
                >
                  {editingBilling
                    ? "Update Invoice"
                    : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="billing-table-card">
          <div className="billing-table-header">
            <h3>Invoices</h3>
          </div>

          {loading ? (
            <div className="billing-empty">
              Loading billing...
            </div>
          ) : billing.length === 0 ? (
            <div className="billing-empty">
              No invoices found.
            </div>
          ) : (
            <div className="billing-table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Appointment</th>
                    <th>Invoice Number</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    {canManageBilling && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {billing.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>

                      <td>
                        {invoice.patient_id}
                      </td>

                      <td>
                        {invoice.appointment_id}
                      </td>

                      <td>
                        {invoice.invoice_number}
                      </td>

                      <td>
                        ₹{Number(invoice.amount || 0).toFixed(2)}
                      </td>

                      <td>
                        {canManageBilling ? (
                          <select
                            value={invoice.payment_status}
                            onChange={(e) =>
                              handleStatusChange(
                                invoice.id,
                                e.target.value
                              )
                            }
                            className={`billing-status billing-status-${invoice.payment_status.toLowerCase()}`}
                          >
                            <option value="Pending">
                              Pending
                            </option>
                            <option value="Paid">
                              Paid
                            </option>
                          </select>
                        ) : (
                          <span
                            className={`billing-status billing-status-${invoice.payment_status.toLowerCase()}`}
                          >
                            {invoice.payment_status}
                          </span>
                        )}
                      </td>

                      {canManageBilling && (
                        <td>
                          <div className="billing-actions">
                            <button
                              className="billing-edit-button"
                              onClick={() =>
                                handleEdit(invoice)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="billing-delete-button"
                              onClick={() =>
                                handleDelete(invoice.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .billing-page {
          padding: 24px;
        }

        .billing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .billing-header h2 {
          margin: 0;
          font-size: 28px;
        }

        .billing-header p {
          margin: 6px 0 0;
          color: #6b7280;
        }

        .billing-primary-button,
        .billing-secondary-button,
        .billing-edit-button,
        .billing-delete-button {
          border: none;
          border-radius: 6px;
          padding: 9px 15px;
          cursor: pointer;
          font-size: 14px;
        }

.billing-primary-button {
  background: var(--primary-color);
  color: white;
}
  .billing-primary-button:hover {
  background: var(--primary-hover);
}

        .billing-secondary-button {
          background: #e5e7eb;
          color: #111827;
        }

        .billing-edit-button {
          background: #e5e7eb;
          color: #111827;
        }

        .billing-delete-button {
          background: #fee2e2;
          color: #b91c1c;
        }

        .billing-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .billing-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 20px;
        }

        .billing-card span {
          display: block;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .billing-card strong {
          font-size: 24px;
        }

        .billing-form-card,
        .billing-table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .billing-form-card {
          padding: 20px;
        }

        .billing-form-header,
        .billing-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .billing-form-header h3,
        .billing-table-header h3 {
          margin: 0;
        }

        .billing-close-button {
          border: none;
          background: transparent;
          font-size: 26px;
          cursor: pointer;
        }

        .billing-form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .billing-field label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .billing-field input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .billing-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .billing-table-header {
          padding: 20px 20px 0;
        }

        .billing-table-wrapper {
          overflow-x: auto;
        }

        .billing-table {
          width: 100%;
          border-collapse: collapse;
        }

        .billing-table th,
        .billing-table td {
          padding: 14px 20px;
          border-top: 1px solid #e5e7eb;
          text-align: left;
          white-space: nowrap;
        }

        .billing-table th {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
        }

        .billing-status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          border: none;
          font-size: 13px;
        }

        .billing-status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .billing-status-paid {
          background: #dcfce7;
          color: #166534;
        }

        .billing-actions {
          display: flex;
          gap: 8px;
        }

        .billing-empty {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }

        .billing-error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        @media (max-width: 900px) {
          .billing-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .billing-form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .billing-page {
            padding: 16px;
          }

          .billing-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .billing-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default BillingPage;