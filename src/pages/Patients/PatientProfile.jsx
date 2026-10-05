import { useEffect } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Button,
  Card,
  Loader,
  PageHeader,
} from "../../components/common";

import RoleBasedRoute from "../../routes/RoleBasedRoute";
import usePatients from "../../modules/patients/hooks/usePatients";

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

const Item = styled.div`
  padding: 12px;

  border: 1px solid
    ${({ theme }) =>
      theme.colors.border};

  border-radius: ${({ theme }) =>
    theme.borderRadius.small};
`;

const Label = styled.div`
  font-size: 12px;

  color: ${({ theme }) =>
    theme.colors.textSecondary};

  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 14px;

  color: ${({ theme }) =>
    theme.colors.textPrimary};

  white-space: pre-wrap;
`;

const ErrorText = styled.div`
  color: ${({ theme }) =>
    theme.colors.danger};
`;

function PatientProfileContent() {
  const { id } = useParams();

  const {
    selectedPatient,
    loading,
    error,
    fetchPatient,
  } = usePatients();

  useEffect(() => {
    fetchPatient(id);
  }, [id, fetchPatient]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorText>
          {error}
        </ErrorText>

        <Link to="/patients">
          Back to Patients
        </Link>
      </DashboardLayout>
    );
  }

  if (!selectedPatient) {
    return (
      <DashboardLayout>
        <p>
          Patient not found.
        </p>

        <Link to="/patients">
          Back to Patients
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={
          selectedPatient.patient_name ||
          "Patient Profile"
        }
        description="Patient details and appointment history."
      />

      <Card>
        <Grid>
          {[
            [
              "Email",
              selectedPatient.email,
            ],
            [
              "Mobile",
              selectedPatient.mobile,
            ],
            [
              "Date of Birth",
              selectedPatient.date_of_birth,
            ],
            [
              "Gender",
              selectedPatient.gender,
            ],
            [
              "Address",
              selectedPatient.address,
            ],
            [
              "Medical Data",
              selectedPatient.medical_data,
            ],
          ].map(
            ([label, value]) => (
              <Item key={label}>
                <Label>
                  {label}
                </Label>

                <Value>
                  {value || "-"}
                </Value>
              </Item>
            )
          )}
        </Grid>
      </Card>

      <Card>
        <h2>
          Appointments
        </h2>

        {selectedPatient
          .appointments
          ?.length ? (
          selectedPatient.appointments.map(
            (appointment) => (
              <Item
                key={appointment.id}
              >
                <Value>
                  {
                    appointment.appointment_date
                  }{" "}
                  {
                    appointment.appointment_time
                  }{" "}
                  —{" "}
                  {
                    appointment.status
                  }
                </Value>

                <Label>
                  {appointment.reason ||
                    "No reason"}
                </Label>
              </Item>
            )
          )
        ) : (
          <p>
            No appointments.
          </p>
        )}
      </Card>

      <Link to="/patients">
        <Button>
          Back to Patients
        </Button>
      </Link>
    </DashboardLayout>
  );
}

export default function PatientProfile() {
  return (
    <RoleBasedRoute
      allowedRoles={[
        "Provider",
        "Nurse",
      ]}
    >
      <PatientProfileContent />
    </RoleBasedRoute>
  );
}