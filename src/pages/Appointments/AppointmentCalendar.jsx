import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Button,
  EmptyState,
  Loader,
  Modal,
  PageHeader,
} from "../../components/common";
import RoleBasedRoute from "../../routes/RoleBasedRoute";
import useCalendar from "../../modules/calendar/hooks/useCalendar";

/* ---------- date helpers (local time, so "today" is always right) ---------- */

const pad = (n) => String(n).padStart(2, "0");

const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fromISO = (iso) => {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const addDays = (iso, days) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

const startOfWeek = (iso) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISO(d);
};

const formatLong = (iso) =>
  fromISO(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatShort = (iso) =>
  fromISO(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const formatTime = (value) => {
  if (!value) return "-";
  const [h, m] = String(value).split(":").map(Number);
  if (Number.isNaN(h)) return value;
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(m || 0)} ${h >= 12 ? "PM" : "AM"}`;
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ---------- status colours ---------- */

const STATUS = {
  completed: { fg: "#15803d", bg: "#dcfce7" },
  cancelled: { fg: "#b91c1c", bg: "#fee2e2" },
  canceled: { fg: "#b91c1c", bg: "#fee2e2" },
  "no show": { fg: "#b45309", bg: "#fef3c7" },
  scheduled: { fg: "#1d4ed8", bg: "#dbeafe" },
  confirmed: { fg: "#1d4ed8", bg: "#dbeafe" },
};

const statusStyle = (s) =>
  STATUS[String(s || "").toLowerCase()] || {
    fg: "#374151",
    bg: "#f3f4f6",
  };

/* ---------- styles ---------- */

const focusRing = css`
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Page = styled.div`
  margin-top: -12px;

  /* tighter gap under the page title so the calendar sits higher */
  & > div:first-child {
    margin-bottom: 10px;
  }

  @media (min-width: 641px) {
    height: calc(100% + 12px);
    display: flex;
    flex-direction: column;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  @media (min-width: 641px) {
    flex: 1;
    min-height: 360px;
  }
`;

/* toolbar never scrolls; only the list below it does (desktop/tablet) */
const Top = styled.div`
  flex: none;
`;

const ListScroll = styled.div`
  @media (min-width: 641px) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
`;

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  @media (max-width: 600px) {
    padding: 14px;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const Segmented = styled.div`
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: ${({ theme }) => theme.colors.disabled};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  @media (max-width: 600px) {
    display: flex;
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

const SegButton = styled.button`
  border: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.surface : "transparent"};
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 2px rgba(0,0,0,.12)" : "none"};

  ${focusRing}
`;

const Outline = styled.button`
  min-height: 40px;
  padding: 0 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.disabled};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${focusRing}
`;

const Arrow = styled(Outline)`
  width: 40px;
  padding: 0;
  font-size: 20px;
  line-height: 1;
`;

const DateInput = styled.input`
  height: 40px;
  min-width: 0;
  padding: 0 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${focusRing}
`;

const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 600px) {
    width: 100%;

    ${DateInput} {
      flex: 1;
    }
  }
`;

const RangeFields = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
  }

  @media (max-width: 600px) {
    width: 100%;

    ${DateInput} {
      flex: 1;
    }
  }
`;

const Chip = styled.button`
  min-height: 32px;
  padding: 0 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.surface : theme.colors.textSecondary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.inputBorder};

  ${focusRing}
`;

const Summary = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Notice = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 12px 20px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.danger};
  background: #fef2f2;
  border-top: 1px solid #fecaca;

  button {
    margin-left: auto;
    cursor: pointer;
    min-height: 32px;
    padding: 0 12px;
    font-weight: 600;
    color: inherit;
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 6px;
  }
`;

const DayHeading = styled.div`
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.disabled};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 600px) {
    padding: 10px 14px;
  }
`;

const Item = styled.div`
  display: grid;
  grid-template-columns:
    100px minmax(0, 1.2fr) minmax(0, 1fr) 120px 84px;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  cursor: pointer;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: #f9fafb;
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "time badge"
      "patient patient"
      "provider provider"
      "view view";
    padding: 14px;
    gap: 6px 12px;
  }
`;

const Time = styled.div`
  font-weight: 700;
  font-size: 15px;

  @media (max-width: 640px) {
    grid-area: time;
  }
`;

const Patient = styled.div`
  min-width: 0;
  font-weight: 600;
  font-size: 15px;
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    grid-area: patient;
    font-size: 16px;
  }
`;

const Provider = styled.div`
  min-width: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;

  @media (max-width: 640px) {
    grid-area: provider;
  }
`;

const Badge = styled.span`
  justify-self: start;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  color: ${({ $fg }) => $fg};
  background: ${({ $bg }) => $bg};

  @media (max-width: 640px) {
    grid-area: badge;
    justify-self: end;
  }
`;

const ViewBtn = styled(Outline)`
  color: ${({ theme }) => theme.colors.primary};
  border-color: ${({ theme }) => theme.colors.primary};
  min-height: 36px;

  @media (max-width: 640px) {
    grid-area: view;
    min-height: 42px;
    width: 100%;
    margin-top: 6px;
  }
`;

const Details = styled.dl`
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 12px 16px;
  margin: 0;
  font-size: 15px;

  dt {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  dd {
    margin: 0;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 2px;

    dd {
      margin-bottom: 10px;
    }
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

/* ---------- page ---------- */

const MODES = [
  { key: "day", label: "Day" },
  { key: "range", label: "Range" },
  { key: "upcoming", label: "Upcoming" },
];

function AppointmentCalendarContent() {
  const today = toISO(new Date());

  const [mode, setMode] = useState("day");
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 6));
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    appointments,
    selectedAppointment,
    loading,
    detailLoading,
    detailError,
    error,
    fetchDay,
    fetchRange,
    fetchUpcoming,
    fetchTooltip,
    clearSelected,
    clearError,
  } = useCalendar();

  const rangeInvalid =
    mode === "range" && (!startDate || !endDate || startDate > endDate);

  const load = useCallback(() => {
    if (mode === "day" && date) fetchDay(date);
    if (mode === "range" && !rangeInvalid) fetchRange(startDate, endDate);
    if (mode === "upcoming") fetchUpcoming();
  }, [
    mode,
    date,
    startDate,
    endDate,
    rangeInvalid,
    fetchDay,
    fetchRange,
    fetchUpcoming,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setStatusFilter("all");
  }, [mode, date, startDate, endDate]);

  const closeDetails = useCallback(() => {
    setDetailOpen(false);
    clearSelected();
  }, [clearSelected]);

  useEffect(() => {
    if (!detailOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDetails();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailOpen, closeDetails]);

  const openDetails = (id) => {
    setDetailOpen(true);
    fetchTooltip(id);
  };

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        `${a.appointment_date} ${a.appointment_time}`.localeCompare(
          `${b.appointment_date} ${b.appointment_time}`
        )
      ),
    [appointments]
  );

  const statuses = useMemo(
    () => [...new Set(sorted.map((a) => a.status || "Unknown"))],
    [sorted]
  );

  const visible = useMemo(
    () =>
      statusFilter === "all"
        ? sorted
        : sorted.filter((a) => (a.status || "Unknown") === statusFilter),
    [sorted, statusFilter]
  );

  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((a) => {
      if (!map.has(a.appointment_date)) map.set(a.appointment_date, []);
      map.get(a.appointment_date).push(a);
    });
    return [...map.entries()];
  }, [visible]);

  const preset = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const heading =
    mode === "day"
      ? formatLong(date)
      : mode === "range"
        ? `${formatShort(startDate)} – ${formatShort(endDate)}`
        : "Upcoming appointments";

  const emptyMessage =
    mode === "day"
      ? `No appointments on ${formatShort(date)}.`
      : mode === "range"
        ? "No appointments in this date range."
        : "No upcoming appointments.";

  return (
    <DashboardLayout>
      <Page>
        <PageHeader
          title="Calendar"
          description="Day, range and upcoming appointment views."
        />

        <Panel>
          <Top>
            {/* Row 1: view + dates */}
            <Bar>
              <Segmented role="group" aria-label="Calendar view">
                {MODES.map((m) => (
                  <SegButton
                    key={m.key}
                    type="button"
                    $active={mode === m.key}
                    aria-pressed={mode === m.key}
                    onClick={() => setMode(m.key)}
                  >
                    {m.label}
                  </SegButton>
                ))}
              </Segmented>

              <Spacer />

              {mode === "day" && (
                <DateNav>
                  <Arrow
                    type="button"
                    aria-label="Previous day"
                    onClick={() => setDate(addDays(date, -1))}
                  >
                    ‹
                  </Arrow>
                  <DateInput
                    type="date"
                    value={date}
                    aria-label="Pick a date"
                    onChange={(e) => e.target.value && setDate(e.target.value)}
                  />
                  <Arrow
                    type="button"
                    aria-label="Next day"
                    onClick={() => setDate(addDays(date, 1))}
                  >
                    ›
                  </Arrow>
                  <Outline
                    type="button"
                    onClick={() => setDate(today)}
                    disabled={date === today}
                  >
                    Today
                  </Outline>
                </DateNav>
              )}

              {mode === "range" && (
                <RangeFields>
                  <DateInput
                    type="date"
                    aria-label="Start date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span>to</span>
                  <DateInput
                    type="date"
                    aria-label="End date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </RangeFields>
              )}
            </Bar>

            {/* Row 2 (range only): quick ranges */}
            {mode === "range" && (
              <Bar>
                <Chip
                  type="button"
                  onClick={() =>
                    preset(startOfWeek(today), addDays(startOfWeek(today), 6))
                  }
                >
                  This week
                </Chip>
                <Chip
                  type="button"
                  onClick={() => preset(today, addDays(today, 6))}
                >
                  Next 7 days
                </Chip>
                <Chip
                  type="button"
                  onClick={() => preset(today, addDays(today, 29))}
                >
                  Next 30 days
                </Chip>
                {rangeInvalid && (
                  <ErrorText role="alert">
                    Start date must be on or before the end date.
                  </ErrorText>
                )}
              </Bar>
            )}

            {error && (
              <Notice role="alert">
                <span>{error}</span>
                <button type="button" onClick={load}>
                  Try again
                </button>
                <button
                  type="button"
                  style={{ marginLeft: 0 }}
                  onClick={clearError}
                >
                  Dismiss
                </button>
              </Notice>
            )}

            {/* Row 3: summary + status filter */}
            <Bar>
              <Summary aria-live="polite">
                <strong>{heading}</strong>
                {!loading && ` · ${plural(visible.length, "appointment")}`}
              </Summary>

              <Spacer />

              {statuses.length > 1 && !loading && (
                <>
                  <Chip
                    type="button"
                    $active={statusFilter === "all"}
                    aria-pressed={statusFilter === "all"}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Chip>
                  {statuses.map((s) => (
                    <Chip
                      key={s}
                      type="button"
                      $active={statusFilter === s}
                      aria-pressed={statusFilter === s}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s}
                    </Chip>
                  ))}
                </>
              )}

              <Button onClick={load} disabled={loading || rangeInvalid}>
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </Bar>
          </Top>

          {/* List */}
          <ListScroll>
            {loading ? (
              <Loader />
            ) : groups.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              groups.map(([groupDate, items]) => (
                <div key={groupDate}>
                  {mode !== "day" && (
                    <DayHeading>
                      {formatShort(groupDate)}
                      {groupDate === today ? " · Today" : ""}
                    </DayHeading>
                  )}

                  {items.map((a) => {
                    const st = statusStyle(a.status);
                    return (
                      <Item key={a.id} onClick={() => openDetails(a.id)}>
                        <Time>{formatTime(a.appointment_time)}</Time>

                        <Patient>{a.patient_name}</Patient>

                        <Provider>{a.provider_name}</Provider>

                        <Badge $fg={st.fg} $bg={st.bg}>
                          {a.status || "Unknown"}
                        </Badge>

                        <ViewBtn
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetails(a.id);
                          }}
                        >
                          View
                        </ViewBtn>
                      </Item>
                    );
                  })}
                </div>
              ))
            )}
          </ListScroll>
        </Panel>
      </Page>

      <Modal
        isOpen={detailOpen}
        title="Appointment details"
        onClose={closeDetails}
      >
        {detailLoading && <Loader />}

        {!detailLoading && detailError && (
          <ErrorText role="alert">{detailError}</ErrorText>
        )}

        {!detailLoading && selectedAppointment && (
          <Details>
            <dt>Patient</dt>
            <dd>{selectedAppointment.patient}</dd>

            <dt>Provider</dt>
            <dd>{selectedAppointment.provider}</dd>

            <dt>Date</dt>
            <dd>
              {selectedAppointment.date
                ? formatLong(selectedAppointment.date)
                : "-"}
            </dd>

            <dt>Time</dt>
            <dd>{formatTime(selectedAppointment.time)}</dd>

            <dt>Status</dt>
            <dd>
              {(() => {
                const st = statusStyle(selectedAppointment.status);
                return (
                  <Badge
                    as="span"
                    $fg={st.fg}
                    $bg={st.bg}
                    style={{ display: "inline-block" }}
                  >
                    {selectedAppointment.status}
                  </Badge>
                );
              })()}
            </dd>

            <dt>Reason</dt>
            <dd>{selectedAppointment.reason || "-"}</dd>
          </Details>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default function AppointmentCalendar() {
  return (
    <RoleBasedRoute allowedRoles={["Provider", "Nurse", "Receptionist"]}>
      <AppointmentCalendarContent />
    </RoleBasedRoute>
  );
}