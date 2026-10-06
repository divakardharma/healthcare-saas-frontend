import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";

import { Card, EmptyState, Loader, PageHeader } from "../../components/common";

import RoleBasedRoute from "../../routes/RoleBasedRoute";
import usePatients from "../../modules/patients/hooks/usePatients";

const APPOINTMENTS_PER_VIEW = 5;

/*
  ---------- Breakpoints (based on real device viewport widths) ----------

  PHONE    <= 480px   iPhone SE 320/375, iPhone 12-15 390/393, Pixel 412,
                      Galaxy S 360, iPhone Pro Max 430
  TWO_COL  <= 1100px  below this the two columns stack into one:
                      iPad portrait 768/820/834, iPad landscape 1024,
                      and small laptops once the 240px sidebar is counted
*/
const PHONE = "480px";
const STACK_COLUMNS = "1100px";
const SMALL = "360px"; // Moto G4, Galaxy S, JioPhone 2, folded foldables

// Date tile width + gap, used to line the status badge up under the text
// when an appointment wraps on phones.
const TILE_WIDTH = 56;
const ITEM_GAP = 12;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ---------- Helpers ---------- */

// Dates are parsed by hand (not with new Date) so a timezone can never
// shift a date of birth or appointment by one day.
const parseDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ""));

  if (!match) {
    return null;
  }

  const [y, m, d] = match.slice(1).map(Number);

  if (m < 1 || m > 12) {
    return null;
  }

  return { y, m, d };
};

const formatDate = (value) => {
  const parts = parseDate(value);

  return parts ? `${parts.d} ${MONTHS[parts.m - 1]} ${parts.y}` : value || "-";
};

const formatTime = (value) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value ?? ""));

  if (!match) {
    return value || "";
  }

  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
};

const getAge = (dateOfBirth) => {
  const dob = parseDate(dateOfBirth);

  if (!dob) {
    return null;
  }

  const today = new Date();

  let years = today.getFullYear() - dob.y;

  let months = today.getMonth() + 1 - dob.m;

  if (today.getDate() < dob.d) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return null;
  }

  if (years < 1) {
    return months < 1 ? "Under 1 month" : `${months} mo`;
  }

  return `${years} ${years === 1 ? "yr" : "yrs"}`;
};

const getInitials = (name) => {
  const letters = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return letters || "P";
};

const getReason = (reason) => {
  const text = String(reason ?? "").trim();

  return !text || /^n\/?a$/i.test(text) ? "No reason given" : text;
};

const getStatusColor = (theme, status) => {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (
    ["cancelled", "canceled", "missed", "no-show", "no_show"].includes(value)
  ) {
    return theme.colors.danger;
  }

  if (["completed", "done", "confirmed"].includes(value)) {
    return theme.colors.success;
  }

  if (["scheduled", "pending", "booked"].includes(value)) {
    return theme.colors.primary;
  }

  return theme.colors.textSecondary;
};

/* ---------- Page shell (large monitors) ---------- */

/*
  On 1920px, 2560px and 4K screens the two columns would stretch across
  more than 2000px. The content is capped and centered instead.
*/
const PageShell = styled.div`
  width: 100%;
  max-width: 1500px;
  min-width: 0;
  margin: 0 auto;
`;

/* ---------- Layout ---------- */

const Stack = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;

  /* A grid child with min-width:auto can force sideways scrolling,
     so every direct child is allowed to shrink. */
  > * {
    min-width: 0;
  }
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 16px;
  align-items: start;

  @media (max-width: ${STACK_COLUMNS}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

/* ---------- Patient banner ---------- */

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: ${PHONE}) {
    gap: 12px;
  }
`;

const Avatar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  font-size: 22px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.primary};

  border-radius: 50%;

  @media (max-width: ${PHONE}) {
    width: 52px;
    height: 52px;
    font-size: 18px;
  }
`;

const BannerInfo = styled.div`
  flex: 1 1 150px;
  min-width: 0;
`;

const PatientName = styled.h2`
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  overflow-wrap: anywhere;

  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: ${PHONE}) {
    font-size: 18px;
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.span`
  padding: 3px 10px;
  font-size: 13px;
  text-transform: capitalize;

  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.disabled};

  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

/* ---------- Details ---------- */

const DetailList = styled.dl`
  margin: 0;
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  padding: 10px 0;

  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  dt {
    font-size: 13px;

    color: ${({ theme }) => theme.colors.textSecondary};
  }

  dd {
    margin: 0;
    font-size: 14px;
    overflow-wrap: anywhere;

    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: ${PHONE}) {
    grid-template-columns: minmax(0, 1fr);
    gap: 2px;
  }
`;

const Notes = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

/* ---------- Appointments ---------- */

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
`;

const FilterButton = styled.button`
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
  cursor: pointer;

  color: ${({ theme, $active }) =>
    $active ? theme.colors.surface : theme.colors.textPrimary};

  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surface};

  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.inputBorder};

  border-radius: ${({ theme }) => theme.borderRadius.small};

  /* Touch screens: bigger tap target. */
  @media (pointer: coarse) {
    height: 40px;
  }
`;

const AppointmentList = styled.div`
  display: grid;
  gap: 10px;
`;

const AppointmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${ITEM_GAP + 2}px;
  min-width: 0;
  padding: 10px 12px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => theme.borderRadius.small};

  /* Phones: the status badge drops under the text instead of
     squeezing the reason into a very narrow column. */
  @media (max-width: ${PHONE}) {
    flex-wrap: wrap;
    gap: ${ITEM_GAP}px;
  }
`;

const DateTile = styled.div`
  flex-shrink: 0;
  width: ${TILE_WIDTH}px;
  padding: 6px 0;
  text-align: center;

  background: ${({ theme }) => theme.colors.disabled};

  border-radius: ${({ theme }) => theme.borderRadius.small};

  strong {
    display: block;
    font-size: 18px;
    line-height: 1.1;

    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    text-transform: uppercase;

    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const AppointmentBody = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: ${PHONE}) {
    flex: 1 1 calc(100% - ${TILE_WIDTH + ITEM_GAP}px);
    min-width: 0;
  }
`;

const AppointmentTime = styled.div`
  font-size: 14px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const AppointmentReason = styled.div`
  margin-top: 2px;
  font-size: 13px;
  overflow-wrap: anywhere;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusBadge = styled.span`
  flex-shrink: 0;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;

  color: ${({ theme, $status }) => getStatusColor(theme, $status)};
  background: ${({ theme }) => theme.colors.surface};

  border: 1px solid currentColor;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  @media (max-width: ${PHONE}) {
    margin-left: ${TILE_WIDTH + ITEM_GAP}px;
  }
`;

const ShowMore = styled.button`
  display: block;
  width: 100%;
  height: 36px;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.surface};

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => theme.borderRadius.small};

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.disabled};
    }
  }

  @media (pointer: coarse) {
    height: 44px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 38px;
  padding: 0 18px;

  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;

  background: ${({ theme }) => theme.colors.primary};

  color: ${({ theme }) => theme.colors.surface};

  border-radius: ${({ theme }) => theme.borderRadius.small};

  transition: background 0.2s ease;

  &:visited {
    color: ${({ theme }) => theme.colors.surface};
  }

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  @media (pointer: coarse) {
    height: 44px;
  }

  @media (max-width: ${PHONE}) {
    padding: 0 14px;
  }

  @media (max-width: ${SMALL}) {
    max-width: 100%;
    height: auto;
    min-height: 40px;
    padding: 8px 12px;
    line-height: 1.2;
    text-align: center;
    white-space: normal;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 14px;
  overflow-wrap: anywhere;
`;

const backAction = <BackLink to="/patients">Back to Patients</BackLink>;

function PatientProfileContent() {
  const { id } = useParams();

  const { selectedPatient, loading, error, fetchPatient } = usePatients();

  const [statusFilter, setStatusFilter] = useState("all");

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchPatient(id);
  }, [id, fetchPatient]);

  useEffect(() => {
    setStatusFilter("all");
    setExpanded(false);
  }, [id]);

  // Newest / upcoming first.
  const appointments = useMemo(() => {
    const list = Array.isArray(selectedPatient?.appointments)
      ? selectedPatient.appointments
      : [];

    const key = (a) =>
      `${a.appointment_date ?? ""}T${a.appointment_time ?? ""}`;

    return [...list].sort((a, b) => key(b).localeCompare(key(a)));
  }, [selectedPatient]);

  const statusCounts = useMemo(() => {
    const counts = new Map();

    appointments.forEach((appointment) => {
      const status = String(appointment.status || "Unknown");

      const name = status.toLowerCase();

      counts.set(name, {
        label: status,
        count: (counts.get(name)?.count || 0) + 1,
      });
    });

    return [...counts.entries()];
  }, [appointments]);

  // The store may still hold the previously viewed patient on the very
  // first render, so never show a record that does not belong to this URL.
  const isStale =
    selectedPatient?.id != null && String(selectedPatient.id) !== String(id);

  if (loading || (isStale && !error)) {
    return (
      <DashboardLayout>
        <PageShell>
          <Loader />
        </PageShell>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <PageShell>
          <PageHeader title="Patient Profile" action={backAction} />

          <ErrorText>{error}</ErrorText>
        </PageShell>
      </DashboardLayout>
    );
  }

  if (!selectedPatient) {
    return (
      <DashboardLayout>
        <PageShell>
          <PageHeader title="Patient Profile" action={backAction} />

          <Card>
            <EmptyState message="Patient not found." />
          </Card>
        </PageShell>
      </DashboardLayout>
    );
  }

  const age = getAge(selectedPatient.date_of_birth);

  const filteredAppointments =
    statusFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) =>
            String(appointment.status || "Unknown").toLowerCase() ===
            statusFilter,
        );

  const visibleAppointments = expanded
    ? filteredAppointments
    : filteredAppointments.slice(0, APPOINTMENTS_PER_VIEW);

  const hiddenCount = filteredAppointments.length - visibleAppointments.length;

  const details = [
    [
      "Date of birth",
      selectedPatient.date_of_birth
        ? formatDate(selectedPatient.date_of_birth)
        : null,
    ],
    ["Gender", selectedPatient.gender],
    ["Mobile", selectedPatient.mobile],
    ["Email", selectedPatient.email],
    ["Address", selectedPatient.address],
  ];

  return (
    <DashboardLayout>
      <PageShell>
        <PageHeader
          title="Patient Profile"
          description="Details and appointment history."
          action={backAction}
        />

        <Stack>
          <Card>
            <Banner>
              <Avatar aria-hidden="true">
                {getInitials(selectedPatient.patient_name)}
              </Avatar>

              <BannerInfo>
                <PatientName>
                  {selectedPatient.patient_name || "Unnamed patient"}
                </PatientName>

                <Chips>
                  <Chip>ID #{selectedPatient.id}</Chip>

                  {age && <Chip>{age}</Chip>}

                  {selectedPatient.gender && (
                    <Chip>{selectedPatient.gender}</Chip>
                  )}
                </Chips>
              </BannerInfo>
            </Banner>
          </Card>

          <Columns>
            <Stack>
              <Card>
                <SectionTitle>Patient details</SectionTitle>

                <DetailList>
                  {details.map(([label, value]) => (
                    <DetailRow key={label}>
                      <dt>{label}</dt>
                      <dd>{value || "-"}</dd>
                    </DetailRow>
                  ))}
                </DetailList>
              </Card>

              <Card>
                <SectionTitle>Medical notes</SectionTitle>

                <Notes>
                  {selectedPatient.medical_data || "No medical notes recorded."}
                </Notes>
              </Card>
            </Stack>

            <Card>
              <SectionTitle>Appointments ({appointments.length})</SectionTitle>

              {appointments.length === 0 ? (
                <EmptyState message="No appointments." />
              ) : (
                <>
                  {statusCounts.length > 1 && (
                    <FilterRow>
                      <FilterButton
                        type="button"
                        $active={statusFilter === "all"}
                        onClick={() => {
                          setStatusFilter("all");
                          setExpanded(false);
                        }}
                      >
                        All ({appointments.length})
                      </FilterButton>

                      {statusCounts.map(([name, info]) => (
                        <FilterButton
                          key={name}
                          type="button"
                          $active={statusFilter === name}
                          onClick={() => {
                            setStatusFilter(name);
                            setExpanded(false);
                          }}
                        >
                          {info.label} ({info.count})
                        </FilterButton>
                      ))}
                    </FilterRow>
                  )}

                  <AppointmentList>
                    {visibleAppointments.map((appointment) => {
                      const date = parseDate(appointment.appointment_date);

                      return (
                        <AppointmentItem key={appointment.id}>
                          <DateTile>
                            <strong>{date ? date.d : "-"}</strong>

                            <span>
                              {date ? `${MONTHS[date.m - 1]} ${date.y}` : ""}
                            </span>
                          </DateTile>

                          <AppointmentBody>
                            <AppointmentTime>
                              {formatTime(appointment.appointment_time) ||
                                "Time not set"}
                            </AppointmentTime>

                            <AppointmentReason>
                              {getReason(appointment.reason)}
                            </AppointmentReason>
                          </AppointmentBody>

                          {appointment.status && (
                            <StatusBadge $status={appointment.status}>
                              {appointment.status}
                            </StatusBadge>
                          )}
                        </AppointmentItem>
                      );
                    })}
                  </AppointmentList>

                  {filteredAppointments.length > APPOINTMENTS_PER_VIEW && (
                    <ShowMore
                      type="button"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
                    </ShowMore>
                  )}
                </>
              )}
            </Card>
          </Columns>
        </Stack>
      </PageShell>
    </DashboardLayout>
  );
}

export default function PatientProfile() {
  return (
    <RoleBasedRoute allowedRoles={["Provider", "Nurse"]}>
      <PatientProfileContent />
    </RoleBasedRoute>
  );
}