import { useEffect, useState } from "react";
import styled, { css } from "styled-components";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  Button,
  Card,
  ConfirmModal,
  EmptyState,
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
import useNotes from "../../modules/notes/hooks/useNotes";

const Form = styled.form`
  display: grid;
  gap: 14px;
  min-width: 0;

  /* iOS Safari zooms the page when a focused field is below 16px. */
  @media (max-width: 700px) {
    input,
    select {
      font-size: 16px;
    }
  }
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

const AppointmentHeader = styled.div`
  @media (max-width: 700px) {
    > div {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    button {
      width: 100%;
    }
  }
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

const PatientSearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PatientSearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PatientResults = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 30;
`;

const PatientResult = styled.button`
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const PatientNoResults = styled.div`
  padding: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ---------- Pagination ---------- */

const PAGE_SIZE = 10;

// The API returns 20 appointments per request (fixed by the backend,
// AppointmentService::BATCH_SIZE). Each batch covers two 10-row pages.
const API_BATCH_SIZE = 20;
const PAGES_PER_BATCH = API_BATCH_SIZE / PAGE_SIZE;

const PHONE = "480px";
const TABLET = "700px";
const SMALL = "360px";

// UI page 1,2 -> batch 1 | page 3,4 -> batch 2 | page 5,6 -> batch 3 ...
const batchForPage = (page) => Math.floor((page - 1) / PAGES_PER_BATCH) + 1;

// 0 for the first UI page of a batch, 1 for the second.
const pageWithinBatchFor = (page) => (page - 1) % PAGES_PER_BATCH;

const TINY = "280px";
const CARD_LAYOUT_MAX_WIDTH = "1199px";

// Fixed row heights so 10 appointments fit on one screen without page
// scrolling, and the pagination bar stays in the same place on every page
// (even the last page with fewer rows). On short screens (laptops with
// browser toolbars / display scaling) the rows shrink a little more.
const HEADER_ROW_HEIGHT = 36;

/* ---------- Page shell (same as Patients) ---------- */

const PageShell = styled.div`
  width: 100%;
  max-width: 1600px;
  min-width: 0;
  margin: 0 auto;
`;

/* ---------- Layout switching: table (desktop) / cards (tablet, phone) ---------- */

const DesktopOnly = styled.div`
  /*
    Row height follows the window height, so 10 rows + the pagination bar
    always fit without a page scrollbar: 42px on tall screens, shrinking
    down to 34px on short ones. The 360px is the space used by everything
    else on the page (top bar, title, card padding, table header,
    pagination bar, and room for the error message when one is shown).
  */
  --row-height: clamp(34px, calc((100vh - 360px) / 10), 42px);
  --button-height: calc(var(--row-height) - 10px);

  table {
    table-layout: fixed;
    width: 100%;
  }

  thead tr {
    height: ${HEADER_ROW_HEIGHT}px;
  }

  tbody tr {
    height: var(--row-height);
  }

  ${({ $reserveSpace }) =>
    $reserveSpace &&
    css`
      min-height: calc(
        ${HEADER_ROW_HEIGHT}px + ${PAGE_SIZE} * var(--row-height)
      );
    `}

  th {
    padding: 8px 12px;
  }

  td {
    padding: 3px 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ID | Patient | Provider | Date | Time | Status | Actions */
  th:nth-child(1) {
    width: 72px;
  }

  th:nth-child(4) {
    width: 120px;
  }

  th:nth-child(5) {
    width: 80px;
  }

  th:nth-child(6) {
    width: 120px;
  }

  th:nth-child(7) {
    width: 270px;
  }

  @media (max-width: ${CARD_LAYOUT_MAX_WIDTH}) {
    display: none;
  }
`;

const CardsOnly = styled.div`
  display: none;

  @media (max-width: ${CARD_LAYOUT_MAX_WIDTH}) {
    display: block;
  }
`;

/* ---------- Table cells ---------- */

const IdText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`;

const NameText = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const statusColor = (theme, status) => {
  if (status === "Completed") {
    return theme.colors.success;
  }

  if (status === "Cancelled") {
    return theme.colors.danger;
  }

  return theme.colors.primary;
};

// Colored pill: blue = Scheduled, green = Completed, red = Cancelled.
const StatusBadge = styled.span`
  display: inline-block;
  min-width: 92px;
  box-sizing: border-box;
  text-align: center;
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;

  color: ${({ theme, $status }) => statusColor(theme, $status)};
  background: ${({ theme, $status }) =>
    statusColor(theme, $status)}1a;

  border-radius: 999px;
`;

/* ---------- Row actions (Edit / Cancel / Complete) ---------- */

/*
  The shared Button does not accept className, so the actions are sized
  together from this wrapper to guarantee identical height, padding and
  alignment (same approach as the Patients page).
*/
const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: nowrap;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: var(--button-height, 30px);
    min-width: 60px;
    padding: 0 8px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }

  /* Card layout: buttons share the full width equally. */
  ${({ $stretch }) =>
    $stretch &&
    css`
      gap: 8px;

      button {
        flex: 1 1 0;
        min-width: 0;
        height: 36px;
        padding: 0 8px;
      }
    `}

  /* Touch screens: bigger tap targets in the card layout. */
  @media (pointer: coarse) {
    ${({ $stretch }) =>
      $stretch &&
      css`
        button {
          height: 44px;
        }
      `}
  }

  /* Very narrow phones: buttons wrap instead of being squeezed. */
  @media (max-width: ${SMALL}) {
    ${({ $stretch }) =>
      $stretch &&
      css`
        flex-wrap: wrap;

        button {
          flex: 1 1 72px;
        }
      `}
  }
`;

/* ---------- Appointment cards (tablet / mobile) ---------- */

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 12px;

  @media (max-width: ${PHONE}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const AppointmentCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;

  background: ${({ theme }) => theme.colors.surface};

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  @media (max-width: ${SMALL}) {
    padding: 10px 12px;
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;

  @media (max-width: ${TINY}) {
    flex-wrap: wrap;
  }
`;

const CardName = styled.h3`
  margin: 0;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const IdBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.disabled};

  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const Details = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 8px 12px;
  margin: 0;

  dt {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  dd {
    margin: 2px 0 0;
    font-size: 14px;
    overflow-wrap: anywhere;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: ${TINY}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const show = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;

// 12:00:00 -> 12:00
const formatTime = (value) =>
  value ? String(value).slice(0, 5) : "—";

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;

  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${TABLET}) {
    justify-content: center;
  }
`;

const PaginationInfo = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: ${TABLET}) {
    width: 100%;
    text-align: center;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  button {
    height: 32px;
    min-width: 84px;
    padding: 0 14px;
  }

  @media (pointer: coarse) {
    button {
      height: 40px;
    }
  }

  @media (max-width: ${PHONE}) {
    width: 100%;
    gap: 8px;

    button {
      flex: 1 1 0;
      min-width: 0;
      padding: 0 8px;
    }
  }

  @media (max-width: ${SMALL}) {
    flex-wrap: wrap;

    > span {
      order: -1;
      flex: 1 0 100%;
    }
  }
`;

const PageIndicator = styled.span`
  min-width: 84px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: ${PHONE}) {
    flex: 0 0 auto;
    min-width: 0;
    font-size: 13px;
  }
`;

function AppointmentListContent() {
  const { user } = useAuth();
  const { users, fetchUsers } = useUsers();

  const {
    batches,
    inFlight,
    batchErrors,
    total,
    hasMore,
    cacheVersion,
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

  const {
  notes,
  loading: notesLoading,
  error: notesError,
  loadNotes,
  createNewNote,
  updateExistingNote,
  deleteExistingNote,
  resetNotes,
} = useNotes();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [cancelId, setCancelId] =
    useState(null);

  const [notesModalOpen, setNotesModalOpen] = useState(false);
const [selectedAppointment, setSelectedAppointment] = useState(null);
const [noteText, setNoteText] = useState("");
const [editingNoteId, setEditingNoteId] = useState(null);

  const [form, setForm] = useState({
    patient_id: "",
    provider_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "Scheduled",
  });

  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);

  const [page, setPage] = useState(1);

  // The appointment cache is cleared after create/update/status/cancel:
  // go back to page 1.
  const [seenCacheVersion, setSeenCacheVersion] =
    useState(cacheVersion);

  if (seenCacheVersion !== cacheVersion) {
    setSeenCacheVersion(cacheVersion);
    setPage(1);
  }

  const filteredPatients = patients.filter((patient) => {
    const query = patientSearch.trim().toLowerCase();

  return (
    (patient.patient_name || "").toLowerCase().includes(query) ||
    String(patient.id).includes(query)
  );
});

  useEffect(() => {
    fetchPatients();
    fetchUsers("Provider");
  }, [
    fetchPatients,
    fetchUsers
  ]);
  const openNotes = (appointment) => {
  setSelectedAppointment(appointment);
  setEditingNoteId(null);
  setNoteText("");
  resetNotes();
  loadNotes(appointment.id);
  setNotesModalOpen(true);
};

  /*
    Pagination: the API sends 20 appointments per request, the table shows 10.
      UI page 1,2 -> batch 1 | 3,4 -> batch 2 | 5,6 -> batch 3 ...
    The total comes from the backend, never from the loaded batches.
  */
  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  // Clamp so the page can never point past the last page.
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const batchNumber = batchForPage(currentPage);

  // 0 = first UI page of the batch (records 1-10), 1 = second (11-20).
  const pageWithinBatch = pageWithinBatchFor(currentPage);

  const currentBatch = batches?.[batchNumber];

  const nextBatchNumber = batchNumber + 1;

  const currentBatchError =
    batchErrors?.[batchNumber] || null;

  // The batch for this page is not here yet and has not failed.
  const currentBatchLoading =
    !currentBatch && !currentBatchError;

  const visibleAppointments = (currentBatch || []).slice(
    pageWithinBatch * PAGE_SIZE,
    pageWithinBatch * PAGE_SIZE + PAGE_SIZE
  );

  // Show the bar when there is more than one page, or when the current batch
  // failed (so Retry stays reachable even if nothing could be counted).
  const showPagination =
    total > PAGE_SIZE || Boolean(currentBatchError);

  // Second UI page of the batch: load the following batch in the background,
  // once, and only if the server says there is more.
  const shouldPrefetchNextBatch =
    hasMore &&
    Boolean(currentBatch) &&
    pageWithinBatch === PAGES_PER_BATCH - 1 &&
    !batches?.[nextBatchNumber] &&
    !inFlight?.[nextBatchNumber] &&
    !batchErrors?.[nextBatchNumber];

  // Load the batch the current page needs. The saga skips it if it is
  // already cached or in flight, and a failed batch is not retried
  // automatically (the user presses Retry).
  useEffect(() => {
    if (
      !currentBatch &&
      !inFlight?.[batchNumber] &&
      !batchErrors?.[batchNumber]
    ) {
      fetchAppointments(batchNumber);
    }
  }, [
    currentBatch,
    inFlight,
    batchErrors,
    batchNumber,
    fetchAppointments,
  ]);

  useEffect(() => {
    if (shouldPrefetchNextBatch) {
      fetchAppointments(nextBatchNumber, { prefetch: true });
    }
  }, [
    shouldPrefetchNextBatch,
    nextBatchNumber,
    fetchAppointments,
  ]);

  // Retry re-requests only the batch the current page belongs to.
  const retryCurrentBatch = () => fetchAppointments(batchNumber);

  const rangeStart = total === 0 ? 0 : startIndex + 1;

  const rangeEnd = Math.min(startIndex + PAGE_SIZE, total);

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

  setPatientSearch("");
  setShowPatientResults(false);

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

  const selectedPatient = patients.find(
    (patient) =>
      Number(patient.id) === Number(row.patient_id)
  );

  setPatientSearch(selectedPatient?.patient_name || row.patient_name || "");
  setShowPatientResults(false);

  setModalOpen(true);
};
  const submit = (event) => {
    event.preventDefault();

if (!form.patient_id || !form.provider_id) {
  alert("Please select a patient and provider.");
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

  // Only actions the backend supports: edit (PUT), cancel (PUT .../cancel),
  // complete (PATCH .../status). There is no delete or detail page.
  const renderActions = (row, stretch = false) => (
    <RowActions $stretch={stretch}>
      
      <Button
  onClick={() => openNotes(row)}
  disabled={actionLoading}
>
  Notes
</Button>
      <Button
        onClick={() => openEdit(row)}
        disabled={actionLoading}
      >
        Edit
      </Button>

      {row.status !== "Cancelled" && (
        <Button
          onClick={() => setCancelId(row.id)}
          disabled={actionLoading}
        >
          Cancel
        </Button>
      )}

      {row.status !== "Completed" &&
        row.status !== "Cancelled" && (
          <Button
            onClick={() =>
              updateStatus(row.id, "Completed")
            }
            disabled={actionLoading}
          >
            Complete
          </Button>
        )}
    </RowActions>
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <IdText>#{row.id}</IdText>,
    },

    {
      key: "patient_name",
      label: "Patient",
      render: (row) => (
        <NameText title={row.patient_name}>
          {show(row.patient_name)}
        </NameText>
      ),
    },

    {
      key: "provider_name",
      label: "Provider",
      render: (row) => (
        <span title={row.provider_name}>
          {show(row.provider_name)}
        </span>
      ),
    },

    {
      key: "appointment_date",
      label: "Date",
      render: (row) => show(row.appointment_date),
    },

    {
      key: "appointment_time",
      label: "Time",
      render: (row) => formatTime(row.appointment_time),
    },

    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge $status={row.status}>
          {show(row.status)}
        </StatusBadge>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (row) => renderActions(row),
    },
  ];

  return (
    <DashboardLayout>
      <PageShell>
    <AppointmentHeader>
  <PageHeader
    title="Appointments"
    description="Create, update, cancel and track appointment status."
    action={
      <Button onClick={openCreate}>
        Add Appointment
      </Button>
    }
  />
</AppointmentHeader>

      {(error || currentBatchError) && (
        <ErrorText>
          {error || currentBatchError}
        </ErrorText>
      )}

      <Card>
        {currentBatchLoading ? (
          <Loader />
        ) : visibleAppointments.length === 0 &&
          !currentBatchError ? (
          <EmptyState message="No appointments found." />
        ) : (
          <>
            {visibleAppointments.length > 0 && (
              <>
                <DesktopOnly $reserveSpace={showPagination}>
                  <Table
                    columns={columns}
                    data={visibleAppointments}
                  />
                </DesktopOnly>

                <CardsOnly>
                  <CardList>
                    {visibleAppointments.map((row) => (
                      <AppointmentCard key={row.id}>
                        <CardTop>
                          <CardName>
                            {show(row.patient_name)}
                          </CardName>

                          <IdBadge>ID {row.id}</IdBadge>
                        </CardTop>

                        <Details>
                          <div>
                            <dt>Provider</dt>
                            <dd>{show(row.provider_name)}</dd>
                          </div>

                          <div>
                            <dt>Date</dt>
                            <dd>{show(row.appointment_date)}</dd>
                          </div>

                          <div>
                            <dt>Time</dt>
                            <dd>{formatTime(row.appointment_time)}</dd>
                          </div>

                          <div>
                            <dt>Status</dt>
                            <dd>
                              <StatusBadge $status={row.status}>
                                {show(row.status)}
                              </StatusBadge>
                            </dd>
                          </div>
                        </Details>

                        {renderActions(row, true)}
                      </AppointmentCard>
                    ))}
                  </CardList>
                </CardsOnly>
              </>
            )}

            {showPagination && (
              <Pagination aria-label="Appointment list pagination">
                <PaginationInfo>
                  Showing {rangeStart}–{rangeEnd} of {total}
                </PaginationInfo>

                <PaginationControls>
                  <Button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <PageIndicator>
                    Page {currentPage} of {totalPages}
                  </PageIndicator>

                  <Button
                    onClick={
                      currentBatchError
                        ? retryCurrentBatch
                        : () => setPage(currentPage + 1)
                    }
                    disabled={!currentBatchError && currentPage === totalPages}
                  >
                    {currentBatchError ? "Retry" : "Next"}
                  </Button>
                </PaginationControls>
              </Pagination>
            )}
          </>
        )}
      </Card>

      <Modal
  isOpen={notesModalOpen}
  title={
    selectedAppointment
      ? `Notes - Appointment #${selectedAppointment.id}`
      : "Appointment Notes"
  }
  onClose={() => {
    setNotesModalOpen(false);
    setSelectedAppointment(null);
    setEditingNoteId(null);
    setNoteText("");
    resetNotes();
  }}
>
  <div>
    {notesLoading && <p>Loading notes...</p>}

    {notesError && (
      <p style={{ color: "red" }}>
        {notesError}
      </p>
    )}

    {!notesLoading && !notesError && notes.length === 0 && (
      <p>No notes added yet.</p>
    )}

    {!notesLoading &&
      notes.map((note) => (
        <div
          key={note.id}
          style={{
            padding: "12px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: "0 0 8px" }}>
            {note.note}
          </p>

          <small style={{ color: "#666" }}>
            Added on:{" "}
            {new Date(note.created_at).toLocaleString()}
          </small>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <Button
              onClick={() => {
                setEditingNoteId(note.id);
                setNoteText(note.note);
              }}
            >
              Edit
            </Button>

            <Button
              onClick={() =>
                deleteExistingNote(
                  note.id,
                  selectedAppointment.id
                )
              }
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

    <div style={{ marginTop: "16px" }}>
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder={
          editingNoteId
            ? "Edit note..."
            : "Enter a new note..."
        }
        rows={4}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <Button
        style={{ marginTop: "10px" }}
        onClick={() => {
          if (!noteText.trim()) return;

          if (editingNoteId) {
            updateExistingNote(
              editingNoteId,
              { note: noteText.trim() },
              selectedAppointment.id
            );
          } else {
createNewNote({
  appointment_id: selectedAppointment.id,
  user_id: user.id,
  note: noteText.trim(),
});
          }

          setNoteText("");
          setEditingNoteId(null);
        }}
      >
        {editingNoteId ? "Update Note" : "Add Note"}
      </Button>
    </div>
  </div>
</Modal>

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
     
{/* PATIENT AUTOCOMPLETE */}
<Label>
  Patient

  <PatientSearchWrapper>
    <PatientSearchInput
      type="text"
      placeholder="Search patient by name or ID..."
      value={patientSearch}
      onChange={(e) => {
        setPatientSearch(e.target.value);
        setShowPatientResults(true);

        setForm((prev) => ({
          ...prev,
          patient_id: "",
        }));
      }}
      onFocus={() => setShowPatientResults(true)}
      required={!form.patient_id}
      disabled={actionLoading}
      autoComplete="off"
    />

    {showPatientResults &&
      patientSearch.trim() !== "" && (
        <PatientResults>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <PatientResult
                key={patient.id}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    patient_id: String(patient.id),
                  }));

                  setPatientSearch(patient.patient_name);
                  setShowPatientResults(false);
                }}
              >
                {patient.patient_name} (#{patient.id})
              </PatientResult>
            ))
          ) : (
            <PatientNoResults>
              No matching patients found
            </PatientNoResults>
          )}
        </PatientResults>
      )}
  </PatientSearchWrapper>
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
      </PageShell>
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