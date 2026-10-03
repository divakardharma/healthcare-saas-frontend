import { useEffect, useState } from "react";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Button,
  Card,
  Loader,
  PageHeader,
  Table,
} from "../../components/common";

import RoleBasedRoute from "../../routes/RoleBasedRoute";
import useCalendar from "../../modules/calendar/hooks/useCalendar";

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 18px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;

  font-size: 13px;

  color: ${({ theme }) =>
    theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 10px 12px;

  border: 1px solid
    ${({ theme }) =>
      theme.colors.inputBorder};

  border-radius: ${({ theme }) =>
    theme.borderRadius.small};
`;

const ErrorText = styled.div`
  color: ${({ theme }) =>
    theme.colors.danger};

  margin-bottom: 14px;
`;

const Detail = styled.div`
  display: grid;
  gap: 8px;
`;

function AppointmentCalendarContent() {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [date, setDate] =
    useState(today);

  const [mode, setMode] =
    useState("day");

  const [startDate, setStartDate] =
    useState(today);

  const [endDate, setEndDate] =
    useState(today);

  const {
    appointments,
    selectedAppointment,
    loading,
    error,
    fetchDay,
    fetchRange,
    fetchUpcoming,
    fetchTooltip,
  } = useCalendar();

  useEffect(() => {
    fetchDay(date);
  }, [date, fetchDay]);

  const load = () => {
    if (mode === "day") {
      fetchDay(date);
    }

    if (mode === "range") {
      fetchRange(
        startDate,
        endDate
      );
    }

    if (mode === "upcoming") {
      fetchUpcoming();
    }
  };

  const columns = [
    {
      key: "appointment_date",
      label: "Date",
    },

    {
      key: "appointment_time",
      label: "Time",
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
      key: "status",
      label: "Status",
    },

    {
      key: "actions",
      label: "Details",

      render: (row) => (
        <Button
          onClick={() =>
            fetchTooltip(row.id)
          }
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        description="Day, range and upcoming appointment views."
      />

      <Card>
        <Controls>
          <Field>
            View

            <select
              value={mode}
              onChange={(e) =>
                setMode(
                  e.target.value
                )
              }
            >
              <option value="day">
                Day
              </option>

              <option value="range">
                Range
              </option>

              <option value="upcoming">
                Upcoming
              </option>
            </select>
          </Field>

          {mode === "day" && (
            <Field>
              Date

              <Input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />
            </Field>
          )}

          {mode === "range" && (
            <>
              <Field>
                Start date

                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field>
                End date

                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                />
              </Field>
            </>
          )}

          <Button
            onClick={load}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Load"}
          </Button>
        </Controls>

        {error && (
          <ErrorText>
            {error}
          </ErrorText>
        )}

        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={appointments}
          />
        )}
      </Card>

      {selectedAppointment && (
        <Card>
          <h2>
            Appointment Details
          </h2>

          <Detail>
            <div>
              Patient:{" "}
              {
                selectedAppointment.patient
              }
            </div>

            <div>
              Provider:{" "}
              {
                selectedAppointment.provider
              }
            </div>

            <div>
              Date:{" "}
              {
                selectedAppointment.date
              }
            </div>

            <div>
              Time:{" "}
              {
                selectedAppointment.time
              }
            </div>

            <div>
              Status:{" "}
              {
                selectedAppointment.status
              }
            </div>

            <div>
              Reason:{" "}
              {
                selectedAppointment.reason ||
                "-"
              }
            </div>
          </Detail>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default function AppointmentCalendar() {
  return (
    <RoleBasedRoute
      allowedRoles={[
        "Provider",
        "Nurse",
        "Receptionist",
      ]}
    >
      <AppointmentCalendarContent />
    </RoleBasedRoute>
  );
}