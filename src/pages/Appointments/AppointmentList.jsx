import { useEffect, useState } from "react";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Loader,
  Modal,
  PageHeader,
  Table,
} from "../../components/common";

import RoleBasedRoute from "../../routes/RoleBasedRoute";

import useAppointments from "../../modules/appointments/hooks/useAppointments";
import usePatients from "../../modules/patients/hooks/usePatients";
import useAuth from "../../modules/auth/hooks/useAuth";
import useUsers from "../../modules/users/hooks/useUsers";

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;

  border: 1px solid
    ${({ theme }) => theme.colors.inputBorder};

  border-radius: ${({ theme }) =>
    theme.borderRadius.small};

  background: ${({ theme }) =>
    theme.colors.surface};

  color: ${({ theme }) =>
    theme.colors.textPrimary};
`;

const Label = styled.label`
  display: grid;
  gap: 6px;

  font-size: 14px;
  font-weight: 500;
`;

function AppointmentListContent() {
  const { user } = useAuth();
  const { users, fetchUsers } = useUsers();

  const {
    appointments,
    loading,
    actionLoading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    updateStatus,
    cancelAppointment,
  } = useAppointments();

  const {
    patients,
    fetchPatients,
  } = usePatients();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [cancelId, setCancelId] =
    useState(null);

  const [form, setForm] = useState({
    patient_id: "",
    provider_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "Scheduled",
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchUsers("Provider");
  }, [
    fetchAppointments,
    fetchPatients,
    fetchUsers
  ]);

  const openCreate = () => {
    setEditing(null);

    setForm({
      patient_id: "",
      provider_id:
        user?.roles?.includes("Provider")
          ? user.id
          : "",
      appointment_date: "",
      appointment_time: "",
      reason: "",
      status: "Scheduled",
    });

    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);

    setForm({
      patient_id:
        row.patient_id || "",

      provider_id:
        row.provider_id || "",

      appointment_date:
        row.appointment_date || "",

      appointment_time:
        (row.appointment_time || "").slice(
          0,
          5
        ),

      reason:
        row.reason || "",

      status:
        row.status || "Scheduled",
    });

    setModalOpen(true);
  };

  const submit = (event) => {
    event.preventDefault();

    if (
      !form.patient_id ||
      !form.provider_id
    ) {
      return;
    }

    const payload = {
      ...form,
      patient_id: Number(form.patient_id),
      provider_id: Number(form.provider_id),
    };

    if (editing) {
      updateAppointment(
        editing.id,
        payload
      );
    } else {
      createAppointment(payload);
    }

    setModalOpen(false);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },

    {
      key: "patient_name",
      label: "Patient",
    },

    {
      key: "provider_name",
      label: "Provider",
    },

    {
      key: "appointment_date",
      label: "Date",
    },

    {
      key: "appointment_time",
      label: "Time",
    },

    {
      key: "status",
      label: "Status",
    },

    {
      key: "actions",
      label: "Actions",

      render: (row) => (
        <Actions>
          <Button
            onClick={() =>
              openEdit(row)
            }
          >
            Edit
          </Button>

          {row.status !== "Cancelled" && (
            <Button
              onClick={() =>
                setCancelId(row.id)
              }
            >
              Cancel
            </Button>
          )}

          {row.status !== "Completed" &&
            row.status !== "Cancelled" && (
              <Button
                onClick={() =>
                  updateStatus(
                    row.id,
                    "Completed"
                  )
                }
              >
                Complete
              </Button>
            )}
        </Actions>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Appointments"
        description="Create, update, cancel and track appointment status."
        action={
          <Button onClick={openCreate}>
            Add Appointment
          </Button>
        }
      />

      {error && (
        <ErrorText>
          {error}
        </ErrorText>
      )}

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={appointments}
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        title={
          editing
            ? "Edit Appointment"
            : "Create Appointment"
        }
        onClose={() =>
          setModalOpen(false)
        }
      >
        <Form onSubmit={submit}>
          <Grid>

            {/* PATIENT */}
            <Label>
              Patient

              <Select
                value={form.patient_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    patient_id:
                      e.target.value,
                  })
                }
                required
                disabled={actionLoading}
              >
                <option value="">
                  Select patient
                </option>

                {patients.map(
                  (patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.patient_name}{" "}
                      (#{patient.id})
                    </option>
                  )
                )}
              </Select>
            </Label>

            {/* PROVIDER */}
       <Label>
  Provider

  <Select
    value={form.provider_id}
    onChange={(e) =>
      setForm({
        ...form,
        provider_id: e.target.value,
      })
    }
    required
    disabled={
      actionLoading ||
      user?.roles?.includes("Provider")
    }
  >
    <option value="">Select provider</option>

    {users.map((provider) => (
      <option key={provider.id} value={provider.id}>
        {provider.name} (#{provider.id})
      </option>
    ))}
  </Select>
</Label>

            {/* DATE */}
            <Input
              label="Date"
              name="appointment_date"
              type="date"
              value={
                form.appointment_date
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  appointment_date:
                    e.target.value,
                })
              }
              required
              disabled={actionLoading}
            />

            {/* TIME */}
            <Input
              label="Time"
              name="appointment_time"
              type="time"
              value={
                form.appointment_time
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  appointment_time:
                    e.target.value,
                })
              }
              required
              disabled={actionLoading}
            />

            {/* REASON */}
            <Input
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason:
                    e.target.value,
                })
              }
              disabled={actionLoading}
            />

            {/* STATUS - EDIT ONLY */}
            {editing && (
              <Label>
                Status

                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value,
                    })
                  }
                  disabled={actionLoading}
                >
                  <option>
                    Scheduled
                  </option>

                  <option>
                    Completed
                  </option>

                  <option>
                    Cancelled
                  </option>
                </Select>
              </Label>
            )}
          </Grid>

          <Actions>
            <Button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={actionLoading}
            >
              {actionLoading
                ? "Saving..."
                : "Save"}
            </Button>
          </Actions>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(cancelId)}
        title="Cancel Appointment"
        message="Cancel this appointment?"
        onCancel={() =>
          setCancelId(null)
        }
        onConfirm={() => {
          cancelAppointment(
            cancelId
          );

          setCancelId(null);
        }}
      />
    </DashboardLayout>
  );
}

export default function AppointmentList() {
  return (
    <RoleBasedRoute
      allowedRoles={[
        "Provider",
        "Nurse",
      ]}
    >
      <AppointmentListContent />
    </RoleBasedRoute>
  );
}