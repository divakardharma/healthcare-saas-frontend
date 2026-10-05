import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import usePatients from "../../modules/patients/hooks/usePatients";

const PAGE_SIZE = 8;

// The API returns 16 patients per request (fixed by the backend,
// PatientService::BATCH_SIZE). Each batch therefore covers two 8-row pages.
const API_BATCH_SIZE = 16;
const PAGES_PER_BATCH = API_BATCH_SIZE / PAGE_SIZE;

// UI page 1,2 -> batch 1 | page 3,4 -> batch 2 | page 5,6 -> batch 3 ...
const batchForPage = (page) => Math.floor((page - 1) / PAGES_PER_BATCH) + 1;

// 0 for the first UI page of a batch, 1 for the second.
const pageWithinBatchFor = (page) => (page - 1) % PAGES_PER_BATCH;

// Fixed table row heights so the pagination bar stays in the same place
// on every page, even when the last page has fewer rows.
const HEADER_ROW_HEIGHT = 38;
const BODY_ROW_HEIGHT = 43;

/*
  ---------- Breakpoints (based on real device viewport widths) ----------

  PHONE   <= 480px   iPhone SE 320/375, iPhone 12-15 390/393, Pixel 412,
                     Galaxy S 360, iPhone Pro Max 430
  TABLET  <= 700px   large phones in landscape, small tablets
  CARDS   <= 1199px  iPad portrait 768/820/834, iPad landscape 1024/1180,
                     small laptops with the 240px sidebar. The table needs
                     ~900px of content width, so cards are used below this.
  Above 1199px       full table (laptops 1280/1366/1440/1920)
*/
const PHONE = "480px";
const TABLET = "700px";
const SMALL = "360px"; // Moto G4, Galaxy S, folded foldables
const TINY = "280px"; // JioPhone 2 (240px) and the narrowest folded phones
const CARD_LAYOUT_MAX_WIDTH = "1199px";

/* ---------- Page shell (large monitors) ---------- */

/*
  On 1920px, 2560px and 4K screens an unlimited-width table becomes very
  hard to read: the eye has to travel too far between a name and its
  buttons. The content is capped and centered instead.
*/
const PageShell = styled.div`
  width: 100%;
  max-width: 1600px;
  min-width: 0;
  margin: 0 auto;
`;

/* ---------- Form styles ---------- */

const Form = styled.form`
  display: grid;
  gap: 14px;
  min-width: 0;

  /*
    iOS Safari zooms the whole page when a focused field has a font size
    below 16px. Using 16px on small screens prevents that zoom.
  */
  @media (max-width: ${TABLET}) {
    input,
    textarea,
    select {
      font-size: 16px;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: ${TABLET}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const TextArea = styled.textarea`
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 90px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;

  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  resize: vertical;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: ${PHONE}) {
    button {
      flex: 1 1 120px;
    }
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 14px;
  overflow-wrap: anywhere;
`;
const FormError = styled.div`
  color: red;
  font-size: 13px;
  margin-top: 4px;
`;

/* ---------- Toolbar / search ---------- */

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const SearchWrap = styled.div`
  flex: 1 1 280px;
  max-width: 420px;
  min-width: 0;

  input {
    padding: 8px 12px;
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: ${TABLET}) {
    flex-basis: 100%;
    max-width: none;

    input {
      font-size: 16px; /* stops iOS zoom-on-focus */
      padding: 10px 12px;
    }
  }
`;

const ResultCount = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ---------- Layout switching ---------- */

const DesktopOnly = styled.div`
  /*
    Compact rows so 8 patients fit on one screen without scrolling.
    Fixed layout + explicit widths keeps columns aligned on every page
    and prevents any horizontal scrolling.
  */
  table {
    table-layout: fixed;
    width: 100%;
  }

  thead tr {
    height: ${HEADER_ROW_HEIGHT}px;
  }

  tbody tr {
    height: ${BODY_ROW_HEIGHT}px;
  }

  ${({ $reserveSpace }) =>
    $reserveSpace &&
    css`
      min-height: ${HEADER_ROW_HEIGHT + PAGE_SIZE * BODY_ROW_HEIGHT}px;
    `}

  th {
    padding: 10px 12px;
  }

  td {
    padding: 6px 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  th:nth-child(1) {
    width: 72px;
  }

  th:nth-child(4) {
    width: 100px;
  }

  th:nth-child(5) {
    width: 130px;
  }

  th:nth-child(6) {
    width: 232px;
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

const GenderText = styled.span`
  text-transform: capitalize;
`;

const NameText = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

/* ---------- Row actions (View / Edit / Delete) ---------- */

const viewButtonLook = css`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};

  border-radius: ${({ theme }) => theme.borderRadius.small};

  transition: background 0.2s ease;

  &:visited {
    color: ${({ theme }) => theme.colors.surface};
  }

  /* Hover only on devices that really hover, so touch screens
     do not keep a "stuck" hover color after a tap. */
  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ViewLink = styled(Link)`
  ${viewButtonLook}
`;

/*
  The shared Button does not accept className, so the three actions are
  sized together from this wrapper to guarantee identical height,
  padding and alignment.
*/
const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;

  a,
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 30px;
    min-width: 64px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
  }

  /* Card layout: buttons share the full width equally. */
  ${({ $stretch }) =>
    $stretch &&
    css`
      gap: 8px;

      a,
      button {
        flex: 1 1 0;
        min-width: 0;
        height: 36px;
        padding: 0 8px;
      }
    `}

  /* Touch screens: bigger tap targets (44px is the recommended minimum). */
  @media (pointer: coarse) {
    a,
    button {
      height: ${({ $stretch }) => ($stretch ? "44px" : "40px")};
    }
  }

  /* Very narrow phones: three buttons wrap onto two rows instead of
     being squeezed until the text is cut off. */
  @media (max-width: ${SMALL}) {
    ${({ $stretch }) =>
      $stretch &&
      css`
        flex-wrap: wrap;

        a,
        button {
          flex: 1 1 72px;
        }
      `}
  }
`;

/* ---------- Patient cards (tablet / mobile) ---------- */

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 12px;

  @media (max-width: ${PHONE}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const PatientCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;

  background: ${({ theme }) => theme.colors.surface};

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  @media (max-width: 360px) {
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

/* ---------- Pagination ---------- */

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

  /* Phones: Previous / Next stretch so they are easy to hit. */
  @media (max-width: ${PHONE}) {
    width: 100%;
    gap: 8px;

    button {
      flex: 1 1 0;
      min-width: 0;
      padding: 0 8px;
    }
  }

  /* Very narrow: "Page 1 of 3" sits above, Previous / Next share the row below. */
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

/* ---------- Helpers ---------- */

const emptyForm = {
  patient_name: "",
  email: "",
  mobile: "",
  date_of_birth: "",
  gender: "",
  address: "",
  medical_data: "",
};

const normalize = (value) => String(value ?? "").toLowerCase();

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const PHONE_LIKE = /^[\d\s+()-]+$/;

const show = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;

function PatientListContent() {
  const {
    patients,
    batches,
    inFlight,
    batchErrors,
    total,
    hasMore,
    cacheVersion,
    actionLoading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  } = usePatients();

const [modalOpen, setModalOpen] = useState(false);
const [editing, setEditing] = useState(null);
const [deleteId, setDeleteId] = useState(null);
const [form, setForm] = useState(emptyForm);
const [query, setQuery] = useState("");
const [page, setPage] = useState(1);

// The patient cache is cleared after create/update/delete: go back to page 1.
const [seenCacheVersion, setSeenCacheVersion] = useState(cacheVersion);

if (seenCacheVersion !== cacheVersion) {
  setSeenCacheVersion(cacheVersion);
  setPage(1);
}

const [formError, setFormError] = useState("");

  // Batch 1 on first load (a no-op when it is already cached).
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const hasSearch = query.trim() !== "";

  const filteredPatients = useMemo(() => {
    const list = Array.isArray(patients) ? patients : [];

    const q = normalize(query).trim();

    if (!q) {
      return list;
    }

    const qDigits = PHONE_LIKE.test(q) ? digitsOnly(q) : "";

    return list.filter(
      (patient) =>
        normalize(patient.patient_name).includes(q) ||
        normalize(patient.email).includes(q) ||
        normalize(patient.mobile).includes(q) ||
        (qDigits && digitsOnly(patient.mobile).includes(qDigits)),
    );
  }, [patients, query]);

  /*
    Browsing (no search): rows come from the server batches in Redux and the
    count comes from the backend total.
    Searching: the existing client-side filter runs over the patients that
    are already loaded (see the search limitation in the pagination notes).
  */
  const browsing = !hasSearch;

  const displayTotal = browsing ? total : filteredPatients.length;

  const totalPages = Math.max(
    1,
    Math.ceil(displayTotal / PAGE_SIZE),
  );

  // Clamp so deleting the last row of the last page never leaves an empty page.
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  // UI page 1,2 -> batch 1 | 3,4 -> batch 2 | 5,6 -> batch 3 ...
  const batchNumber = batchForPage(currentPage);

  // 0 = first UI page of the batch (records 1-8), 1 = second (records 9-16).
  const pageWithinBatch = pageWithinBatchFor(currentPage);

  const currentBatch = batches[batchNumber];

  const nextBatchNumber = batchNumber + 1;

  const currentBatchError = browsing
    ? batchErrors[batchNumber] || null
    : null;

  // The batch for this page is not here yet and has not failed.
  const currentBatchLoading =
    browsing && !currentBatch && !currentBatchError;

  const visiblePatients = browsing
    ? (currentBatch || []).slice(
        pageWithinBatch * PAGE_SIZE,
        pageWithinBatch * PAGE_SIZE + PAGE_SIZE,
      )
    : filteredPatients.slice(
        startIndex,
        startIndex + PAGE_SIZE,
      );

  // Show the bar when there is more than one page, or when the current batch
  // failed (so Retry stays reachable even if nothing could be counted).
  const showPagination =
    displayTotal > PAGE_SIZE || Boolean(currentBatchError);

  // Second UI page of the batch: load the following batch in the background,
  // once, and only if the server says there is more.
  const shouldPrefetchNextBatch =
    browsing &&
    hasMore &&
    Boolean(currentBatch) &&
    pageWithinBatch === PAGES_PER_BATCH - 1 &&
    !batches[nextBatchNumber] &&
    !inFlight[nextBatchNumber] &&
    !batchErrors[nextBatchNumber];

  // Load the batch the current page needs. The saga skips it if it is
  // already cached or in flight, and a failed batch is not retried
  // automatically (the user presses Retry).
  useEffect(() => {
    if (
      browsing &&
      !currentBatch &&
      !inFlight[batchNumber] &&
      !batchErrors[batchNumber]
    ) {
      fetchPatients(batchNumber);
    }
  }, [
    browsing,
    currentBatch,
    inFlight,
    batchErrors,
    batchNumber,
    fetchPatients,
  ]);

  useEffect(() => {
    if (shouldPrefetchNextBatch) {
      fetchPatients(nextBatchNumber, { prefetch: true });
    }
  }, [shouldPrefetchNextBatch, nextBatchNumber, fetchPatients]);

  // Retry re-requests only the batch the current page belongs to.
  const retryCurrentBatch = () => fetchPatients(batchNumber);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

 const openCreate = () => {
  setEditing(null);
  setForm(emptyForm);
  setFormError("");
  setModalOpen(true);
};

 const openEdit = (patient) => {
  setEditing(patient);

  setFormError("");

  setForm({
    ...emptyForm,
    ...patient,
    medical_data: patient.medical_data || "",
  });

  setModalOpen(true);
};
const submit = (event) => {
  event.preventDefault();

  setFormError("");

  const mobile = form.mobile.trim();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    setFormError(
      "Enter a valid 10-digit mobile number"
    );
    return;
  }

  if (editing) {
    updatePatient(editing.id, form);
  } else {
    createPatient(form);
  }

  setModalOpen(false);
};

  const renderActions = (row, stretch = false) => (
    <RowActions $stretch={stretch}>
      <ViewLink to={`/patients/${row.id}`}>View</ViewLink>

      <Button onClick={() => openEdit(row)}>Edit</Button>

      <Button onClick={() => setDeleteId(row.id)}>Delete</Button>
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
        <NameText title={row.patient_name}>{show(row.patient_name)}</NameText>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      render: (row) => <span title={row.mobile}>{show(row.mobile)}</span>,
    },
    {
      key: "gender",
      label: "Gender",
      render: (row) => <GenderText>{show(row.gender)}</GenderText>,
    },
    {
      key: "date_of_birth",
      label: "Date of Birth",
      render: (row) => show(row.date_of_birth),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => renderActions(row),
    },
  ];

  const emptyMessage = hasSearch
    ? `No patients match "${query.trim()}". Try a different name, mobile number or email.`
    : "No patients found.";

  const rangeStart = displayTotal === 0 ? 0 : startIndex + 1;

  const rangeEnd = Math.min(startIndex + PAGE_SIZE, displayTotal);

  const setField = (name) => (e) =>
    setForm({
      ...form,
      [name]: e.target.value,
    });

  return (
    <DashboardLayout>
      <PageShell>
        <PageHeader
          title="Patients"
          description="Manage tenant patient records."
          action={<Button onClick={openCreate}>Add Patient</Button>}
        />

        {(error || currentBatchError) && (
          <ErrorText>{error || currentBatchError}</ErrorText>
        )}

        <Card>
          <Toolbar>
            <SearchWrap>
              <Input
                name="patient_search"
                type="search"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search by name, mobile or email"
                autoComplete="off"
              />
            </SearchWrap>

            {!currentBatchLoading && (
              <ResultCount>
                {displayTotal}{" "}
                {displayTotal === 1 ? "patient" : "patients"}
              </ResultCount>
            )}
          </Toolbar>

          {currentBatchLoading ? (
            <Loader />
          ) : visiblePatients.length === 0 && !currentBatchError ? (
            <EmptyState message={emptyMessage} />
          ) : (
            <>
              {visiblePatients.length > 0 && (
              <>
              <DesktopOnly $reserveSpace={showPagination}>
                <Table columns={columns} data={visiblePatients} />
              </DesktopOnly>

              <CardsOnly>
                <CardList>
                  {visiblePatients.map((patient) => (
                    <PatientCard key={patient.id}>
                      <CardTop>
                        <CardName>{show(patient.patient_name)}</CardName>

                        <IdBadge>ID {patient.id}</IdBadge>
                      </CardTop>

                      <Details>
                        <div>
                          <dt>Mobile</dt>
                          <dd>{show(patient.mobile)}</dd>
                        </div>

                        <div>
                          <dt>Gender</dt>
                          <dd>
                            <GenderText>{show(patient.gender)}</GenderText>
                          </dd>
                        </div>

                        <div>
                          <dt>Date of Birth</dt>
                          <dd>{show(patient.date_of_birth)}</dd>
                        </div>
                      </Details>

                      {renderActions(patient, true)}
                    </PatientCard>
                  ))}
                </CardList>
              </CardsOnly>
              </>
              )}

              {showPagination && (
                <Pagination aria-label="Patient list pagination">
                  <PaginationInfo>
                    Showing {rangeStart}–{rangeEnd} of {displayTotal}
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
          isOpen={modalOpen}
          title={editing ? "Edit Patient" : "Add Patient"}
          onClose={() => setModalOpen(false)}
        >
          <Form onSubmit={submit}>
            <Grid>
              <Input
                label="Patient Name"
                name="patient_name"
                value={form.patient_name}
                onChange={setField("patient_name")}
                required
                disabled={actionLoading}
              />

            <Input
  label="Mobile"
  name="mobile"
  type="tel"
  value={form.mobile}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");

    setForm({
      ...form,
      mobile: value,
    });

    if (formError) {
      setFormError("");
    }
  }}
  required
  maxLength={10}
  disabled={actionLoading}
/>

{formError && (
  <FormError>{formError}</FormError>
)}
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={setField("email")}
                disabled={actionLoading}
              />

              <Input
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={setField("date_of_birth")}
                max={new Date().toISOString().split("T")[0]}
                disabled={actionLoading}
              />

              <Input
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={setField("gender")}
                disabled={actionLoading}
              />

              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={setField("address")}
                disabled={actionLoading}
              />
            </Grid>

            <label>
              Medical Data
              <TextArea
                value={form.medical_data}
                onChange={setField("medical_data")}
              />
            </label>

            <Actions>
              <Button type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save"}
              </Button>
            </Actions>
          </Form>
        </Modal>

        <ConfirmModal
          isOpen={Boolean(deleteId)}
          title="Delete Patient"
          message="The backend performs a soft delete. Continue?"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            deletePatient(deleteId);
            setDeleteId(null);
          }}
        />
      </PageShell>
    </DashboardLayout>
  );
}

export default function PatientList() {
  return (
    <RoleBasedRoute allowedRoles={["Provider", "Nurse"]}>
      <PatientListContent />
    </RoleBasedRoute>
  );
}