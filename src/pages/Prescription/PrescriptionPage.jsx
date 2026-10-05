import { useEffect, useState } from "react";
import { usePrescription } from "../../modules/prescription/hooks/usePrescription";
import DashboardLayout from "../../components/layout/DashboardLayout";

const emptyMedicine = {
  medicine_id: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: ""
};

function PrescriptionPage() {
  const {
    prescriptions,
    loading,
    error,
    loadPrescriptions,
    addPrescription,
    removePrescription,
    changePrescriptionStatus
  } = usePrescription();

  const [showForm, setShowForm] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    provider_id: "",
    appointment_id: "",
    notes: "",
    items: [{ ...emptyMedicine }]
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
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
      items: [...prev.items, { ...emptyMedicine }]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.items.length === 1) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const handleCreate = (event) => {
    event.preventDefault();

    const data = {
      patient_id: Number(formData.patient_id),
      provider_id: Number(formData.provider_id),
      appointment_id: formData.appointment_id
        ? Number(formData.appointment_id)
        : null,
      notes: formData.notes,
      items: formData.items.map((item) => ({
        medicine_id: Number(item.medicine_id),
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: Number(item.quantity)
      }))
    };

    addPrescription(data);

    setFormData({
      patient_id: "",
      provider_id: "",
      appointment_id: "",
      notes: "",
      items: [{ ...emptyMedicine }]
    });

    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      removePrescription(id);
    }
  };

  const handleStatusChange = (id, status) => {
    changePrescriptionStatus(id, { status });
  };

  return (
    <DashboardLayout>
      <div className="prescription-page">
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
            background: #2563eb;
            color: #ffffff;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
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

          .form-textarea {
            min-height: 90px;
            resize: vertical;
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
            background: #2563eb;
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

          .action-buttons {
            display: flex;
            gap: 7px;
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
            background: #dbeafe;
            color: #1d4ed8;
          }

          .delete-button {
            background: #fee2e2;
            color: #b91c1c;
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
          }

          .item-list li {
            margin-bottom: 6px;
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
            .medicine-grid {
              grid-template-columns: 1fr;
            }

            .full-width {
              grid-column: auto;
            }
          }
        `}</style>

        <div className="prescription-header">
          <div>
            <h1 className="prescription-title">Prescriptions</h1>
            <p className="prescription-subtitle">
              Manage patient prescriptions and pharmacy status
            </p>
          </div>

          <button
            className="add-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "+ Create Prescription"}
          </button>
        </div>

        {showForm && (
          <div className="prescription-card">
            <h2 className="form-title">Create Prescription</h2>

            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Patient ID</label>
                  <input
                    className="form-input"
                    type="number"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Provider ID</label>
                  <input
                    className="form-input"
                    type="number"
                    name="provider_id"
                    value={formData.provider_id}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment ID</label>
                  <input
                    className="form-input"
                    type="number"
                    name="appointment_id"
                    value={formData.appointment_id}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Notes</label>
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
                  <h3 className="medicine-title">Medicines</h3>

                  <button
                    type="button"
                    className="add-medicine-button"
                    onClick={addMedicine}
                  >
                    + Add Medicine
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div className="medicine-card" key={index}>
                    <div className="medicine-grid">
                      <div className="form-group">
                        <label className="form-label">Medicine ID</label>
                        <input
                          className="form-input"
                          type="number"
                          name="medicine_id"
                          value={item.medicine_id}
                          onChange={(event) =>
                            handleMedicineChange(index, event)
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dosage</label>
                        <input
                          className="form-input"
                          type="text"
                          name="dosage"
                          value={item.dosage}
                          onChange={(event) =>
                            handleMedicineChange(index, event)
                          }
                          placeholder="500mg"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Frequency</label>
                        <input
                          className="form-input"
                          type="text"
                          name="frequency"
                          value={item.frequency}
                          onChange={(event) =>
                            handleMedicineChange(index, event)
                          }
                          placeholder="Twice daily"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Duration</label>
                        <input
                          className="form-input"
                          type="text"
                          name="duration"
                          value={item.duration}
                          onChange={(event) =>
                            handleMedicineChange(index, event)
                          }
                          placeholder="5 days"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input
                          className="form-input"
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(event) =>
                            handleMedicineChange(index, event)
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
                        onClick={() => removeMedicine(index)}
                      >
                        Remove Medicine
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button className="save-button" type="submit">
                  Create Prescription
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
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

          {!loading && !error && prescriptions.length === 0 && (
            <p className="empty-message">
              No prescriptions found.
            </p>
          )}

          {!loading && !error && prescriptions.length > 0 && (
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
                      <td>{prescription.patient_id}</td>
                      <td>{prescription.provider_id}</td>
                      <td>
                        <select
                          className="status-select"
                          value={prescription.status || "Pending"}
                          onChange={(event) =>
                            handleStatusChange(
                              prescription.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                          <option value="Dispensed">Dispensed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{prescription.notes || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button view-button"
                            onClick={() =>
                              setViewPrescription(prescription)
                            }
                          >
                            View
                          </button>

                          <button
                            className="action-button delete-button"
                            onClick={() =>
                              handleDelete(prescription.id)
                            }
                          >
                            Delete
                          </button>
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
            <h2 className="form-title">Prescription Details</h2>

            <div className="view-row">
              <span className="view-label">ID:</span>
              <span>{viewPrescription.id}</span>
            </div>

            <div className="view-row">
              <span className="view-label">Patient ID:</span>
              <span>{viewPrescription.patient_id}</span>
            </div>

            <div className="view-row">
              <span className="view-label">Provider ID:</span>
              <span>{viewPrescription.provider_id}</span>
            </div>

            <div className="view-row">
              <span className="view-label">Status:</span>
              <span>{viewPrescription.status || "Pending"}</span>
            </div>

            <div className="view-row">
              <span className="view-label">Notes:</span>
              <span>{viewPrescription.notes || "-"}</span>
            </div>

            {viewPrescription.items?.length > 0 && (
              <div className="view-row">
                <span className="view-label">Medicines:</span>

                <ul className="item-list">
                  {viewPrescription.items.map((item, index) => (
                    <li key={index}>
                      Medicine ID: {item.medicine_id} |{" "}
                      {item.dosage} | {item.frequency} |{" "}
                      {item.duration} | Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="cancel-button"
              onClick={() => setViewPrescription(null)}
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