import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import usePatients from "../../modules/patients/hooks/usePatients";

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    2,
    minmax(0, 1fr)
  );
  gap: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;

  border: 1px solid
    ${({ theme }) =>
      theme.colors.inputBorder};

  border-radius: ${({ theme }) =>
    theme.borderRadius.small};

  resize: vertical;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ErrorText = styled.div`
  color: ${({ theme }) =>
    theme.colors.danger};

  margin-bottom: 14px;
`;

const emptyForm = {
  patient_name: "",
  email: "",
  mobile: "",
  date_of_birth: "",
  gender: "",
  address: "",
  medical_data: "",
};

function PatientListContent() {
  const {
    patients,
    loading,
    actionLoading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  } = usePatients();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [deleteId, setDeleteId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (patient) => {
    setEditing(patient);

    setForm({
      ...emptyForm,
      ...patient,
      medical_data:
        patient.medical_data || "",
    });

    setModalOpen(true);
  };

  const submit = (event) => {
    event.preventDefault();

    if (editing) {
      updatePatient(
        editing.id,
        form
      );
    } else {
      createPatient(form);
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
      key: "mobile",
      label: "Mobile",
    },

    {
      key: "gender",
      label: "Gender",
    },

    {
      key: "date_of_birth",
      label: "Date of Birth",
    },

    {
      key: "actions",
      label: "Actions",

      render: (row) => (
        <Actions>
          <Link
            to={`/patients/${row.id}`}
          >
            View
          </Link>

          <Button
            onClick={() =>
              openEdit(row)
            }
          >
            Edit
          </Button>

          <Button
            onClick={() =>
              setDeleteId(row.id)
            }
          >
            Delete
          </Button>
        </Actions>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Patients"
        description="Manage tenant patient records."
        action={
          <Button onClick={openCreate}>
            Add Patient
          </Button>
        }
      />

      {error && (
        <ErrorText>{error}</ErrorText>
      )}

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={patients}
          />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        title={
          editing
            ? "Edit Patient"
            : "Add Patient"
        }
        onClose={() =>
          setModalOpen(false)
        }
      >
        <Form onSubmit={submit}>
          <Grid>
            <Input
              label="Patient Name"
              name="patient_name"
              value={form.patient_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  patient_name:
                    e.target.value,
                })
              }
              required
              disabled={actionLoading}
            />

            <Input
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile:
                    e.target.value,
                })
              }
              required
              disabled={actionLoading}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
              disabled={actionLoading}
            />

            <Input
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={(e) =>
                setForm({
                  ...form,
                  date_of_birth:
                    e.target.value,
                })
              }
              disabled={actionLoading}
            />

            <Input
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={(e) =>
                setForm({
                  ...form,
                  gender:
                    e.target.value,
                })
              }
              disabled={actionLoading}
            />

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address:
                    e.target.value,
                })
              }
              disabled={actionLoading}
            />
          </Grid>

          <label>
            Medical Data

            <TextArea
              value={form.medical_data}
              onChange={(e) =>
                setForm({
                  ...form,
                  medical_data:
                    e.target.value,
                })
              }
            />
          </label>

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
        isOpen={Boolean(deleteId)}
        title="Delete Patient"
        message="The backend performs a soft delete. Continue?"
        onCancel={() =>
          setDeleteId(null)
        }
        onConfirm={() => {
          deletePatient(deleteId);
          setDeleteId(null);
        }}
      />
    </DashboardLayout>
  );
}

export default function PatientList() {
  return (
    <RoleBasedRoute
      allowedRoles={[
        "Provider",
        "Nurse",
      ]}
    >
      <PatientListContent />
    </RoleBasedRoute>
  );
}