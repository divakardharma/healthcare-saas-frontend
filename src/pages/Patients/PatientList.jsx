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

import {
  CARD_LAYOUT_MAX_WIDTH,
  PHONE,
  SMALL,
  TABLET,
  CardList,
  CardName,
  CardTop,
  CardsOnly,
  Details,
  IdBadge,
  IdText,
  NameText,
  PageIndicator,
  PageShell,
  Pagination,
  PaginationInfo,
} from "../../components/common/listStyles";

import RoleBasedRoute from "../../routes/RoleBasedRoute";
import usePatients from "../../modules/patients/hooks/usePatients";

const PAGE_SIZE = 8;

const API_BATCH_SIZE = 16;
const PAGES_PER_BATCH = API_BATCH_SIZE / PAGE_SIZE;

const batchForPage = (page) => Math.floor((page - 1) / PAGES_PER_BATCH) + 1;

const pageWithinBatchFor = (page) => (page - 1) % PAGES_PER_BATCH;

const HEADER_ROW_HEIGHT = 38;
const BODY_ROW_HEIGHT = 43;

const Form = styled.form`
  display: grid;
  gap: 14px;
  min-width: 0;

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
      font-size: 16px;
      padding: 10px 12px;
    }
  }
`;

const ResultCount = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DesktopOnly = styled.div`
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

const GenderText = styled.span`
  text-transform: capitalize;
`;

const viewButtonLook = css`
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

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ViewLink = styled(Link)`
  ${viewButtonLook}
`;

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

  @media (pointer: coarse) {
    a,
    button {
      height: ${({ $stretch }) => ($stretch ? "44px" : "40px")};
    }
  }

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

  const browsing = !hasSearch;

  const displayTotal = browsing ? total : filteredPatients.length;

  const totalPages = Math.max(
    1,
    Math.ceil(displayTotal / PAGE_SIZE),
  );

  // Clamp so deleting the last row of the last page never leaves an empty page.
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const batchNumber = batchForPage(currentPage);

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

  const showPagination =
    displayTotal > PAGE_SIZE || Boolean(currentBatchError);

  const shouldPrefetchNextBatch =
    browsing &&
    hasMore &&
    Boolean(currentBatch) &&
    pageWithinBatch === PAGES_PER_BATCH - 1 &&
    !batches[nextBatchNumber] &&
    !inFlight[nextBatchNumber] &&
    !batchErrors[nextBatchNumber];

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
      render: (row) => <IdText>{row.id}</IdText>,
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