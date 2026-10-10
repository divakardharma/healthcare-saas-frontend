
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../modules/auth/hooks/useAuth";
import useBilling from "../../modules/billing/hooks/useBilling";
import {
  getPatientsForBilling,
  getAppointmentsForBilling
} from "../../modules/billing/billingAPI";

import "./BillingPage.css";

const BillingTheme = styled.div`
  --bill-primary: ${({ theme }) => theme.colors.primary};
  --bill-primary-hover: ${({ theme }) => theme.colors.primaryHover};
  --bill-primary-soft: color-mix(
    in srgb,
    ${({ theme }) => theme.colors.primary} 14%,
    transparent
  );
  --bill-on-primary: ${({ theme }) => theme.colors.surface};
  --bill-surface: ${({ theme }) => theme.colors.surface};
  --bill-background: ${({ theme }) => theme.colors.background};
  --bill-border: ${({ theme }) => theme.colors.border};
  --bill-input-border: ${({ theme }) => theme.colors.inputBorder};
  --bill-hover: ${({ theme }) => theme.colors.disabled};
  --bill-text: ${({ theme }) => theme.colors.textPrimary};
  --bill-muted: ${({ theme }) => theme.colors.textSecondary};
  --bill-success: ${({ theme }) => theme.colors.success};
  --bill-danger: ${({ theme }) => theme.colors.danger};
  --bill-radius: ${({ theme }) => theme.borderRadius.medium};
  --bill-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
`;

const getPatientName = (patient) =>
  patient?.patient_name || patient?.full_name || patient?.name || "Unnamed";

const formatTime = (time) => (time ? String(time).slice(0, 5) : "");

const getAppointmentLabel = (appointment) =>
  [
    `#${appointment.id}`,
    [appointment.appointment_date, formatTime(appointment.appointment_time)]
      .filter(Boolean)
      .join(" "),
    appointment.status
  ]
    .filter(Boolean)
    .join(" · ");

const getAppointmentDetails = (appointment) =>
  [
    getAppointmentLabel(appointment),
    appointment.provider_name && `Dr. ${appointment.provider_name}`
  ]
    .filter(Boolean)
    .join(" · ");

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const statusClass = (status) =>
  `billing-status billing-status--${String(status || "pending").toLowerCase()}`;

const EMPTY_FORM = {
  patient_id: "",
  appointment_id: "",
  amount: ""
};

const BillingPage = () => {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const {
    billing,
    loading,
    error,
    loadBilling,
    loadPaymentSummary,
    addBilling,
    editBilling,
    removeBilling,
    changePaymentStatus
  } = useBilling();

  const userRoles = user?.roles || [];

  const isAdmin = userRoles.includes("Admin");
  const isProvider = userRoles.includes("Provider");
  const isNurse = userRoles.includes("Nurse");

  const canManageBilling = isAdmin || isProvider;
  const canViewBilling = canManageBilling || isNurse;

  // Calculate all invoice totals in one pass.
  const calculatedSummary = useMemo(() => {
    return billing.reduce(
      (summary, invoice) => {
        const amount = Number(invoice.amount) || 0;

        summary.total_invoices += 1;
        summary.total_amount += amount;

        if (invoice.payment_status === "Paid") {
          summary.paid_amount += amount;
        } else if (invoice.payment_status === "Pending") {
          summary.pending_amount += amount;
        }

        return summary;
      },
      {
        total_invoices: 0,
        total_amount: 0,
        paid_amount: 0,
        pending_amount: 0
      }
    );
  }, [billing]);

  // Create a patient ID-to-name lookup for the invoice table.
  const patientNames = useMemo(() => {
    const map = new Map();

    patients.forEach((patient) => {
      map.set(String(patient.id), getPatientName(patient));
    });

    return map;
  }, [patients]);

  const selectedPatient = useMemo(
    () =>
      patients.find(
        (patient) => String(patient.id) === String(formData.patient_id)
      ),
    [patients, formData.patient_id]
  );

  const selectedAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) =>
          String(appointment.id) === String(formData.appointment_id)
      ),
    [appointments, formData.appointment_id]
  );

  // Filter appointments only when appointments or patient selection changes.
  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          String(appointment.patient_id) === String(formData.patient_id)
      ),
    [appointments, formData.patient_id]
  );

  useEffect(() => {
    if (!canViewBilling) return;

    loadBilling();
    loadPaymentSummary();

    if (!canManageBilling) return;

    let cancelled = false;

    const loadBillingOptions = async () => {
      try {
        const [patientResponse, appointmentResponse] = await Promise.all([
          getPatientsForBilling(),
          getAppointmentsForBilling()
        ]);

        if (cancelled) return;

        setPatients(
          Array.isArray(patientResponse.data) ? patientResponse.data : []
        );
        setAppointments(
          Array.isArray(appointmentResponse.data)
            ? appointmentResponse.data
            : []
        );
      } catch (loadError) {
        if (!cancelled) {
          console.error("Failed to load billing options", loadError);
        }
      }
    };

    loadBillingOptions();

    return () => {
      cancelled = true;
    };
  }, [canViewBilling, canManageBilling]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "patient_id" ? { appointment_id: "" } : {})
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingBilling(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const patientId = Number(formData.patient_id);
    const appointmentId = Number(formData.appointment_id);
    const amount = Number(formData.amount);

    if (
      !Number.isInteger(patientId) ||
      patientId <= 0 ||
      !Number.isInteger(appointmentId) ||
      appointmentId <= 0 ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return;
    }

    const data = {
      patient_id: patientId,
      appointment_id: appointmentId,
      amount
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
  };

  const handleEdit = (invoice) => {
    setEditingBilling(invoice);

    setFormData({
      patient_id: invoice.patient_id ?? "",
      appointment_id: invoice.appointment_id ?? "",
      amount: invoice.amount ?? ""
    });

    setShowForm(true);
  };

  const handleDelete = (billingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (confirmed) {
      removeBilling(billingId);
    }
  };

  const handleStatusChange = (billingId, status) => {
    changePaymentStatus(billingId, status);
  };

  if (!canViewBilling) {
    return (
      <DashboardLayout>
        <BillingTheme className="billing-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to view billing.</p>
        </BillingTheme>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BillingTheme className="billing-page">
        <div className="billing-header">
          <div>
            <h2>Billing & Payment</h2>
            <p>Manage invoices and payment status</p>
          </div>

          {canManageBilling && (
            <button
              type="button"
              className="billing-btn billing-btn--primary"
              onClick={() => setShowForm(true)}
            >
              Create Invoice
            </button>
          )}
        </div>

        {error && <div className="billing-error">{error}</div>}

        <div className="billing-summary">
          <div className="billing-card billing-card--primary">
            <span className="billing-card__label">Total Invoices</span>
            <strong className="billing-card__value">
              {calculatedSummary.total_invoices}
            </strong>
          </div>

          <div className="billing-card">
            <span className="billing-card__label">Total Amount</span>
            <strong className="billing-card__value">
              {formatMoney(calculatedSummary.total_amount)}
            </strong>
          </div>

          <div className="billing-card billing-card--success">
            <span className="billing-card__label">Paid Amount</span>
            <strong className="billing-card__value">
              {formatMoney(calculatedSummary.paid_amount)}
            </strong>
          </div>

          <div className="billing-card billing-card--warning">
            <span className="billing-card__label">Pending Amount</span>
            <strong className="billing-card__value">
              {formatMoney(calculatedSummary.pending_amount)}
            </strong>
          </div>
        </div>

        {showForm && canManageBilling && (
          <div className="billing-form-card">
            <div className="billing-form-header">
              <h3>{editingBilling ? "Edit Invoice" : "Create Invoice"}</h3>

              <button
                type="button"
                className="billing-close-button"
                onClick={resetForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="billing-form-grid">
                <div className="billing-field">
                  <label htmlFor="billing-patient">Patient</label>
                  <select
                    id="billing-patient"
                    className="billing-input"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {getPatientName(patient)} (ID: {patient.id})
                      </option>
                    ))}
                  </select>

                  <small
                    className={`billing-field-hint${
                      selectedPatient ? " billing-field-hint--selected" : ""
                    }`}
                  >
                    {selectedPatient
                      ? `${getPatientName(selectedPatient)} (ID: ${selectedPatient.id})`
                      : "Select the patient for this invoice"}
                  </small>
                </div>

                <div className="billing-field">
                  <label htmlFor="billing-appointment">Appointment</label>
                  <select
                    id="billing-appointment"
                    className="billing-input"
                    name="appointment_id"
                    value={formData.appointment_id}
                    onChange={handleChange}
                    required
                    disabled={!formData.patient_id}
                  >
                    <option value="">
                      {formData.patient_id
                        ? "Select an appointment"
                        : "Select a patient first"}
                    </option>

                    {filteredAppointments.map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {getAppointmentLabel(appointment)}
                      </option>
                    ))}
                  </select>

                  <small
                    className={`billing-field-hint${
                      selectedAppointment ? " billing-field-hint--selected" : ""
                    }`}
                  >
                    {selectedAppointment
                      ? getAppointmentDetails(selectedAppointment)
                      : formData.patient_id
                      ? "Only this patient's appointments are shown"
                      : "Choose a patient first"}
                  </small>
                </div>

                <div className="billing-field">
                  <label htmlFor="billing-amount">Amount (₹)</label>
                  <input
                    id="billing-amount"
                    className="billing-input"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                  <small className="billing-field-hint">
                    Invoice total in rupees
                  </small>
                </div>
              </div>

              <div className="billing-form-actions">
                <button
                  type="button"
                  className="billing-btn billing-btn--secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="billing-btn billing-btn--primary"
                  disabled={loading}
                >
                  {editingBilling ? "Update Invoice" : "Create Invoice"}
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
            <div className="billing-empty">Loading billing...</div>
          ) : billing.length === 0 ? (
            <div className="billing-empty">No invoices found.</div>
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
                  {billing.map((invoice) => {
                    const patientName = patientNames.get(
                      String(invoice.patient_id)
                    );

                    return (
                      <tr key={invoice.id}>
                        <td data-label="ID">{invoice.id}</td>

                        <td data-label="Patient">
                          <span>
                            {patientName || `Patient ${invoice.patient_id}`}
                            {patientName && (
                              <span className="billing-sub">
                                ID: {invoice.patient_id}
                              </span>
                            )}
                          </span>
                        </td>

                        <td data-label="Appointment">
                          #{invoice.appointment_id}
                        </td>

                        <td data-label="Invoice No.">
                          {invoice.invoice_number}
                        </td>

                        <td data-label="Amount" className="billing-amount">
                          {formatMoney(invoice.amount)}
                        </td>

                        <td data-label="Status">
                          {canManageBilling ? (
                            <select
                              value={invoice.payment_status}
                              onChange={(e) =>
                                handleStatusChange(invoice.id, e.target.value)
                              }
                              className={statusClass(invoice.payment_status)}
                              aria-label={`Payment status for invoice ${invoice.id}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          ) : (
                            <span
                              className={statusClass(invoice.payment_status)}
                            >
                              {invoice.payment_status}
                            </span>
                          )}
                        </td>

                        {canManageBilling && (
                          <td data-label="Actions">
                            <div className="billing-actions">
                              <button
                                type="button"
                                className="billing-btn billing-btn--small billing-btn--edit"
                                onClick={() => handleEdit(invoice)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="billing-btn billing-btn--small billing-btn--delete"
                                onClick={() => handleDelete(invoice.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </BillingTheme>
    </DashboardLayout>
  );
};

export default BillingPage;
