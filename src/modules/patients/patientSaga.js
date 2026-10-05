import {
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import {
  getPatientsAPI,
  getPatientAPI,
  createPatientAPI,
  updatePatientAPI,
  deletePatientAPI,
} from "./patientAPI";

import {
  fetchPatientsRequest,
  fetchPatientsStart,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  resetPatientBatches,
  fetchPatientRequest,
  fetchPatientSuccess,
  fetchPatientFailure,
  createPatientRequest,
  updatePatientRequest,
  deletePatientRequest,
  patientActionSuccess,
  patientActionFailure,
} from "./patientSlice";

import { decryptData } from "../../services/encryptionService";

const decryptResponse = (response) =>
  decryptData(response.data.payload);

const getErrorMessage = (error, fallback) => {
  try {
    const payload =
      error.response?.data?.payload;

    if (payload) {
      return (
        decryptData(payload)?.message ||
        fallback
      );
    }
  } catch (_) {}

  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

const selectPatients = (state) => state.patients;

// Fetches ONE batch (16 patients). Used for both the batch the user is
// waiting on and background prefetches, so duplicate protection lives here.
function* fetchPatients(action) {
  const { page, prefetch } = action.payload;

  const { batches, inFlight, cacheVersion } =
    yield select(selectPatients);

  // Already cached, or already being requested: never request it twice.
  if (batches[page] || inFlight[page]) {
    return;
  }

  yield put(fetchPatientsStart({ page, prefetch }));

  try {
    const result = decryptResponse(
      yield call(getPatientsAPI, page)
    );

    const patients = Array.isArray(result.data)
      ? result.data
      : [];

    const pagination = result.pagination || {};

    yield put(
      fetchPatientsSuccess({
        page,
        version: cacheVersion,
        patients,
        total: Number.isFinite(pagination.total)
          ? pagination.total
          : patients.length,
        hasMore: Boolean(pagination.has_more),
      })
    );
  } catch (error) {
    yield put(
      fetchPatientsFailure({
        page,
        version: cacheVersion,
        message: getErrorMessage(
          error,
          "Failed to fetch patients"
        ),
      })
    );
  }
}

// After any create/update/delete the cached batches are stale (ids shift
// between batches), so drop them and reload batch 1.
function* refreshPatientsAfterChange() {
  yield put(resetPatientBatches());
  yield put(fetchPatientsRequest(1));
}

function* fetchPatient(action) {
  try {
    const result = decryptResponse(
      yield call(
        getPatientAPI,
        action.payload
      )
    );

    yield put(
      fetchPatientSuccess(result.data)
    );
  } catch (error) {
    yield put(
      fetchPatientFailure(
        getErrorMessage(
          error,
          "Failed to fetch patient"
        )
      )
    );
  }
}

function* createPatient(action) {
  try {
    const result = decryptResponse(
      yield call(
        createPatientAPI,
        action.payload
      )
    );

    yield put(
      patientActionSuccess(result.data)
    );

    yield call(refreshPatientsAfterChange);
  } catch (error) {
    yield put(
      patientActionFailure(
        getErrorMessage(
          error,
          "Failed to create patient"
        )
      )
    );
  }
}

function* updatePatient(action) {
  try {
    const { id, data } = action.payload;

    const result = decryptResponse(
      yield call(
        updatePatientAPI,
        id,
        data
      )
    );

    yield put(
      patientActionSuccess(result.data)
    );

    yield call(refreshPatientsAfterChange);
  } catch (error) {
    yield put(
      patientActionFailure(
        getErrorMessage(
          error,
          "Failed to update patient"
        )
      )
    );
  }
}

function* deletePatient(action) {
  try {
    yield call(
      deletePatientAPI,
      action.payload
    );

    yield put(patientActionSuccess({}));
    yield call(refreshPatientsAfterChange);
  } catch (error) {
    yield put(
      patientActionFailure(
        getErrorMessage(
          error,
          "Failed to delete patient"
        )
      )
    );
  }
}

export default function* patientSaga() {
  // takeEvery (not takeLatest): a prefetch and a page change can overlap,
  // and takeLatest would cancel the first and leave it stuck "in flight".
  yield takeEvery(
    fetchPatientsRequest.type,
    fetchPatients
  );

  yield takeLatest(
    fetchPatientRequest.type,
    fetchPatient
  );

  yield takeLatest(
    createPatientRequest.type,
    createPatient
  );

  yield takeLatest(
    updatePatientRequest.type,
    updatePatient
  );

  yield takeLatest(
    deletePatientRequest.type,
    deletePatient
  );
}