import { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import { usePrescription } from "../../modules/prescription/hooks/usePrescription";
import useAuth from "../../modules/auth/hooks/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import usePatients from "../../modules/patients/hooks/usePatients";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import useMedicines from "../../modules/medicines/hooks/useMedicines";

const emptyMedicine = {
  medicine_id: "",
  medicine_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: ""
};

const emptyForm = {
  patient_id: "",
  provider_id: "",
  appointment_id: "",
  notes: "",
  status: "Pending",
  items: [{ ...emptyMedicine }]
};

function PrescriptionPage() {
  const {
    prescriptions,
    loading,
    error,
    loadPrescriptions,
    addPrescription,
    editPrescription,
    removePrescription,
    changePrescriptionStatus
  } = usePrescription();

  const {
  patients,
  fetchPatients
} = usePatients();

const {
  medicines,
  loading: medicinesLoading,
  error: medicinesError,
  loadMedicines
} = useMedicines();

  const { user } = useAuth();
  const theme = useTheme();
  const {
  batches,
  fetchAppointments
} = useAppointments();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const userRoles = user?.roles || [];

  const isAdmin = userRoles.includes("Admin");
  const isProvider = userRoles.includes("Provider");
  const isPharmacist = userRoles.includes("Pharmacist");

const canCreate = isProvider;
const canEdit = isProvider;
const canDelete = isProvider;
const canChangeStatus = isPharmacist;

useEffect(() => {
  loadPrescriptions();
  fetchPatients();
  fetchAppointments(1);
  loadMedicines();
}, []);

const resetForm = () => {
  setFormData({
    patient_id: "",
    provider_id: "",
    appointment_id: "",
    notes: "",
    status: "Pending",
    items: [{ ...emptyMedicine }]
  });

  setEditingId(null);
  setShowForm(false);
};

  const appointments = Object.values(batches || {})
  .flat()
  .filter(
    (appointment) =>
      String(appointment.patient_id) === String(formData.patient_id) &&
      String(appointment.provider_id) === String(user?.id)
  );

const handleChange = (event) => {
  const { name, value } = event.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
    ...(name === "patient_id"
      ? { appointment_id: "" }
      : {})
  }));
};

const handleMedicineSearch = (index, value) => {
  const selectedMedicine = medicines.find(
    (medicine) =>
      `${medicine.name} (ID: ${medicine.id})` === value
  );

  setFormData((prev) => ({
    ...prev,
    items: prev.items.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            medicine_name: value,
            medicine_id: selectedMedicine
              ? selectedMedicine.id
              : ""
          }
        : item
    )
  }));
};
const handleMedicineChange = (index, event) => {
  const { name, value } = event.target;

  setFormData((prev) => ({
    ...prev,
    items: prev.items.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [name]: value
          }
        : item
    )
  }));
};
  const addMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...emptyMedicine
        }
      ]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.items.length === 1) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter(
        (_, itemIndex) => itemIndex !== index
      )
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      patient_id: Number(formData.patient_id),
      provider_id: Number(user.id),
      appointment_id: formData.appointment_id
        ? Number(formData.appointment_id)
        : null,
      notes: formData.notes,
      status: editingId
    ? formData.status : "Pending",
      items: formData.items.map((item) => ({
        medicine_id: Number(item.medicine_id),
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: Number(item.quantity)
      }))
    };

    if (editingId) {
      editPrescription(editingId, data);
    } else {
      addPrescription(data);
    }

    resetForm();

    // setTimeout(() => {
    //   loadPrescriptions();
    // }, 500);
  };

  const handleEdit = (prescription) => {
    if (!canEdit) {
      return;
    }

    setEditingId(prescription.id);

    setFormData({
      patient_id: prescription.patient_id || "",
      provider_id: prescription.provider_id || "",
      appointment_id: prescription.appointment_id || "",
      notes: prescription.notes || "",
      items:
        prescription.items?.length > 0
          ? prescription.items.map((item) => ({
             medicine_id: item.medicine_id || "",
medicine_name:
  medicines.find(
    (medicine) =>
      String(medicine.id) ===
      String(item.medicine_id)
  )?.name
    ? `${medicines.find(
        (medicine) =>
          String(medicine.id) ===
          String(item.medicine_id)
      ).name} (ID: ${item.medicine_id})`
    : "",
dosage: item.dosage || "",
frequency: item.frequency || "",
duration: item.duration || "",
quantity: item.quantity || ""
            }))
          : [{ ...emptyMedicine }]
    });

    setViewPrescription(null);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!canDelete) {
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this prescription?"
      )
    ) {
      removePrescription(id);

      // setTimeout(() => {
      //   loadPrescriptions();
      // }, 500);
    }
  };

  const handleStatusChange = (id, status) => {
    if (!canChangeStatus) {
      return;
    }

    changePrescriptionStatus(id, {
      status
    });

    // setTimeout(() => {
    //   loadPrescriptions();
    // }, 500);
  };

  return (
    <DashboardLayout>
      <div
  className="prescription-page"
  style={{
    "--primary-color": theme.colors.primary,
    "--primary-hover": theme.colors.primaryHover,
    "--primary-soft": `${theme.colors.primary}22`
  }}
>
        <style>{`
          .prescription-page {
            padding: 24px;
          }

          .prescription-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
          }

          .prescription-title {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
          }

          .prescription-subtitle {
            margin: 6px 0 0;
            color: #6b7280;
            font-size: 14px;
          }

        .add-button {
           border: none;
           border-radius: 8px;
           padding: 11px 18px;
           background: var(--primary-color);
           color: #ffffff;
           cursor: pointer;
           font-size: 14px;
           font-weight: 600;
          }
           .add-button:hover,
.save-button:hover {
  background: var(--primary-hover);
}

          .prescription-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 22px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            margin-bottom: 24px;
          }

          .form-title {
            margin: 0 0 18px;
            font-size: 20px;
            color: #1f2937;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .form-label {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
          }

          .form-input,
          .form-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1d5db;
            border-radius: 7px;
            padding: 10px 12px;
            font-size: 14px;
            outline: none;
          }

          .form-input:focus,
          .form-textarea:focus {
            border-color: #2563eb;
          }

    .form-input:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
}

          .medicine-section {
            margin-top: 24px;
          }

          .medicine-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .medicine-title {
            margin: 0;
            font-size: 17px;
            color: #1f2937;
          }

          .add-medicine-button {
            border: none;
            border-radius: 7px;
            padding: 8px 13px;
            background: #16a34a;
            color: #ffffff;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
          }

          .medicine-card {
            border: 1px solid #e5e7eb;
            border-radius: 9px;
            padding: 16px;
            margin-bottom: 12px;
          }

          .medicine-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
          }

          .remove-medicine-button {
            margin-top: 12px;
            border: none;
            border-radius: 6px;
            padding: 7px 12px;
            background: #fee2e2;
            color: #b91c1c;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          }

          .form-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }

          .save-button,
          .cancel-button {
            border: none;
            border-radius: 7px;
            padding: 10px 18px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          }

          .save-button {
  background: var(--primary-color);
  color: #ffffff;
}

          .cancel-button {
            background: #e5e7eb;
            color: #374151;
          }

          .table-wrapper {
            overflow-x: auto;
          }

          .prescription-table {
            width: 100%;
            border-collapse: collapse;
          }

          .prescription-table th,
          .prescription-table td {
            padding: 13px 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
            font-size: 14px;
          }

          .prescription-table th {
            background: #f9fafb;
            color: #374151;
          }

          .status-select {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 6px 8px;
          }

          .status-text {
            font-weight: 600;
            color: #374151;
          }

          .action-buttons {
            display: flex;
            gap: 7px;
            flex-wrap: wrap;
          }

          .action-button {
            border: none;
            border-radius: 6px;
            padding: 7px 10px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          }

       .view-button {
  background: var(--primary-soft);
  color: var(--primary-color);
}

          .delete-button {
            background: #fee2e2;
            color: #b91c1c;
          }

          .edit-button {
            background: #fef3c7;
            color: #92400e;
          }

          .loading-message,
          .empty-message {
            padding: 20px;
            text-align: center;
            color: #6b7280;
          }

          .error-message {
            padding: 15px;
            text-align: center;
            color: #b91c1c;
            background: #fef2f2;
            border-radius: 8px;
          }

          .view-row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
          }

          .view-label {
            min-width: 140px;
            font-weight: 600;
            color: #374151;
          }

          .item-list {
            margin: 8px 0 0 140px;
            padding-left: 20px;
          }

          .item-list li {
            margin-bottom: 10px;
          }

          .medicine-detail {
            display: grid;
            grid-template-columns: repeat(2, minmax(150px, 1fr));
            gap: 4px 20px;
          }

          @media (max-width: 900px) {
            .form-grid,
            .medicine-grid {
              grid-template-columns: 1fr 1fr;
            }
          }

          @media (max-width: 600px) {
            .prescription-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .form-grid,
            .medicine-grid,
            .medicine-detail {
              grid-template-columns: 1fr;
            }

            .full-width {
              grid-column: auto;
            }

            .view-row {
              flex-direction: column;
              gap: 4px;
            }

            .item-list {
              margin-left: 0;
            }
          }
        `}</style>

        <div className="prescription-header">
          <div>
            <h1 className="prescription-title">
              Prescriptions
            </h1>

            <p className="prescription-subtitle">
              Manage patient prescriptions and pharmacy status
            </p>
          </div>

          {canCreate && (
            <button
              className="add-button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setEditingId(null);
                  setFormData({
                    ...emptyForm,
                    items: [{ ...emptyMedicine }]
                  });
                  setShowForm(true);
                }
              }}
            >
              {showForm
                ? "Close Form"
                : "+ Create Prescription"}
            </button>
          )}
        </div>

        {showForm && canCreate && (
          <div className="prescription-card">
            <h2 className="form-title">
              {editingId
                ? "Edit Prescription"
                : "Create Prescription"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
<div className="form-group">
  <label className="form-label">Patient</label>
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
        {patient.patient_name} (ID: {patient.id})
      </option>
    ))}
  </select>
</div>

                {/* <div className="form-group">
                  <label className="form-label">
                    Provider ID
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    name="provider_id"
                    value={formData.provider_id}
                    onChange={handleChange}
                    required
                  />
                </div> */}

                <div className="form-group">
                  <label className="form-label">
                    Appointment ID
                  </label>

<select
  className="form-input"
  name="appointment_id"
  value={formData.appointment_id}
  onChange={handleChange}
  disabled={!formData.patient_id}
>
  <option value="">
    {formData.patient_id
      ? "Select Appointment"
      : "Select Patient First"}
  </option>

  {appointments.map((appointment) => (
    <option
      key={appointment.id}
      value={appointment.id}
    >
      Appointment #{appointment.id} -{" "}
      {appointment.appointment_date}{" "}
      {appointment.appointment_time}
    </option>
  ))}
</select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Notes
                  </label>

                  <textarea
                    className="form-textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter prescription notes"
                  />
                </div>
              </div>

              <div className="medicine-section">
                <div className="medicine-header">
                  <h3 className="medicine-title">
                    Medicines
                  </h3>

                  <button
                    type="button"
                    className="add-medicine-button"
                    onClick={addMedicine}
                  >
                    + Add Medicine
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div
                    className="medicine-card"
                    key={`${item.medicine_id}-${index}`}
                  >
                    <div className="medicine-grid">
                      <div className="form-group">
  <label className="form-label">
    Medicine
  </label>

  <input
    className="form-input"
    type="text"
    list={`medicine-list-${index}`}
    value={item.medicine_name}
    onChange={(event) =>
      handleMedicineSearch(
        index,
        event.target.value
      )
    }
    placeholder={
      medicinesLoading
        ? "Loading medicines..."
        : "Search medicine..."
    }
    disabled={medicinesLoading}
    required
  />

  <datalist id={`medicine-list-${index}`}>
    {medicines.map((medicine) => (
      <option
        key={medicine.id}
        value={`${medicine.name} (ID: ${medicine.id})`}
      />
    ))}
  </datalist>

  {item.medicine_id && (
    <small
      style={{
        display: "block",
        marginTop: "5px",
        color: "#6b7280",
        fontSize: "12px"
      }}
    >
      Medicine ID: {item.medicine_id}
    </small>
  )}
</div>

                      <div className="form-group">
                        <label className="form-label">
                          Dosage
                        </label>

                        <input
                          className="form-input"
                          type="text"
                          name="dosage"
                          value={item.dosage}
                          onChange={(event) =>
                            handleMedicineChange(
                              index,
                              event
                            )
                          }
                          placeholder="500mg"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Frequency
                        </label>

                        <input
                          className="form-input"
                          type="text"
                          name="frequency"
                          value={item.frequency}
                          onChange={(event) =>
                            handleMedicineChange(
                              index,
                              event
                            )
                          }
                          placeholder="Twice daily"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Duration
                        </label>

                        <input
                          className="form-input"
                          type="text"
                          name="duration"
                          value={item.duration}
                          onChange={(event) =>
                            handleMedicineChange(
                              index,
                              event
                            )
                          }
                          placeholder="5 days"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Quantity
                        </label>

                        <input
                          className="form-input"
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(event) =>
                            handleMedicineChange(
                              index,
                              event
                            )
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        className="remove-medicine-button"
                        onClick={() =>
                          removeMedicine(index)
                        }
                      >
                        Remove Medicine
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Prescription"
                    : "Create Prescription"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="prescription-card">
          {loading && (
            <p className="loading-message">
              Loading prescriptions...
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            prescriptions.length === 0 && (
              <p className="empty-message">
                No prescriptions found.
              </p>
            )}

          {!loading &&
            !error &&
            prescriptions.length > 0 && (
              <div className="table-wrapper">
                <table className="prescription-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td>{prescription.id}</td>

                        <td>
                          {prescription.patient_id}
                        </td>

                        <td>
                          {prescription.provider_id}
                        </td>

                        <td>
                          {canChangeStatus ? (
                            <select
                              className="status-select"
                              value={
                                prescription.status ||
                                "Pending"
                              }
                              onChange={(event) =>
                                handleStatusChange(
                                  prescription.id,
                                  event.target.value
                                )
                              }
                              disabled={loading}
                            >
                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Verified">
                                Verified
                              </option>

                              <option value="Dispensed">
                                Dispensed
                              </option>

                              <option value="Cancelled">
                                Cancelled
                              </option>
                            </select>
                          ) : (
                            <span className="status-text">
                              {prescription.status ||
                                "Pending"}
                            </span>
                          )}
                        </td>

                        <td>
                          {prescription.notes || "-"}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button view-button"
                              onClick={() =>
                                setViewPrescription(
                                  prescription
                                )
                              }
                            >
                              View
                            </button>

                            {canEdit && (
                              <button
                                className="action-button edit-button"
                                onClick={() =>
                                  handleEdit(
                                    prescription
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}

                            {canDelete && (
                              <button
                                className="action-button delete-button"
                                onClick={() =>
                                  handleDelete(
                                    prescription.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {viewPrescription && (
          <div className="prescription-card">
            <h2 className="form-title">
              Prescription Details
            </h2>

            <div className="view-row">
              <span className="view-label">
                ID:
              </span>

              <span>
                {viewPrescription.id}
              </span>
            </div>

            <div className="view-row">
              <span className="view-label">
                Patient ID:
              </span>

              <span>
                {viewPrescription.patient_id}
              </span>
            </div>

            <div className="view-row">
              <span className="view-label">
                Provider ID:
              </span>

              <span>
                {viewPrescription.provider_id}
              </span>
            </div>

            <div className="view-row">
              <span className="view-label">
                Status:
              </span>

              <span>
                {viewPrescription.status ||
                  "Pending"}
              </span>
            </div>

            <div className="view-row">
              <span className="view-label">
                Notes:
              </span>

              <span>
                {viewPrescription.notes || "-"}
              </span>
            </div>

            {viewPrescription.items?.length > 0 && (
              <div className="view-row">
                <span className="view-label">
                  Medicines:
                </span>

                <ul className="item-list">
                  {viewPrescription.items.map(
                    (item, index) => (
                      <li key={`${item.medicine_id}-${index}`}>
                        <div className="medicine-detail">
                          <span>
                            <strong>
                              Medicine ID:
                            </strong>{" "}
                            {item.medicine_id}
                          </span>

                          <span>
                            <strong>
                              Dosage:
                            </strong>{" "}
                            {item.dosage}
                          </span>

                          <span>
                            <strong>
                              Frequency:
                            </strong>{" "}
                            {item.frequency}
                          </span>

                          <span>
                            <strong>
                              Duration:
                            </strong>{" "}
                            {item.duration}
                          </span>

                          <span>
                            <strong>
                              Quantity:
                            </strong>{" "}
                            {item.quantity}
                          </span>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <button
              className="cancel-button"
              onClick={() =>
                setViewPrescription(null)
              }
            >
              Close
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PrescriptionPage;