import {
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import {
  getAppointmentsAPI,
  getAppointmentAPI,
  createAppointmentAPI,
  updateAppointmentAPI,
  updateAppointmentStatusAPI,
  cancelAppointmentAPI,
} from "./appointmentAPI";

import {
  fetchAppointmentsRequest,
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  invalidateAppointmentBatches,
  fetchAppointmentRequest,
  fetchAppointmentSuccess,
  fetchAppointmentFailure,
  createAppointmentRequest,
  updateAppointmentRequest,
  updateAppointmentStatusRequest,
  cancelAppointmentRequest,
  appointmentActionSuccess,
  appointmentActionFailure,
} from "./appointmentSlice";

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

const selectAppointments = (state) => state.appointments;

// Fetches ONE batch (20 appointments). Used for both the batch the user is
// waiting on and background prefetches, so duplicate protection lives here.
function* fetchAppointments(action) {
  const { page, prefetch } = action.payload;

  const { batches, inFlight, cacheVersion } =
    yield select(selectAppointments);

  // Already cached, or already being requested: never request it twice.
  if (batches[page] || inFlight[page]) {
    return;
  }

  yield put(fetchAppointmentsStart({ page, prefetch }));

  try {
    const result = decryptResponse(
      yield call(getAppointmentsAPI, page)
    );

    const appointments = Array.isArray(result.data)
      ? result.data
      : [];

    const pagination = result.pagination || {};

    yield put(
      fetchAppointmentsSuccess({
        page,
        version: cacheVersion,
        appointments,
        total: Number.isFinite(pagination.total)
          ? pagination.total
          : appointments.length,
        hasMore: Boolean(pagination.has_more),
      })
    );
  } catch (error) {
    yield put(
      fetchAppointmentsFailure({
        page,
        version: cacheVersion,
        message: getErrorMessage(
          error,
          "Failed to fetch appointments"
        ),
      })
    );
  }
}

// After any create/update/status/cancel the cached batches are stale
// (appointments move between batches), so drop them and reload batch 1 only.
function* refreshAppointmentsAfterChange() {
  yield put(invalidateAppointmentBatches());
  yield put(fetchAppointmentsRequest(1));
}

function* fetchAppointment(action) {
  try {
    const result = decryptResponse(
      yield call(
        getAppointmentAPI,
        action.payload
      )
    );

    yield put(
      fetchAppointmentSuccess(result.data)
    );
  } catch (error) {
    yield put(
      fetchAppointmentFailure(
        getErrorMessage(
          error,
          "Failed to fetch appointment"
        )
      )
    );
  }
}

function* createAppointment(action) {
  try {
    const result = decryptResponse(
      yield call(
        createAppointmentAPI,
        action.payload
      )
    );

    yield put(
      appointmentActionSuccess(result.data)
    );

    yield call(refreshAppointmentsAfterChange);
  } catch (error) {
    yield put(
      appointmentActionFailure(
        getErrorMessage(
          error,
          "Failed to create appointment"
        )
      )
    );
  }
}

function* updateAppointment(action) {
  try {
    const { id, data } = action.payload;

    const result = decryptResponse(
      yield call(
        updateAppointmentAPI,
        id,
        data
      )
    );

    yield put(
      appointmentActionSuccess(result.data)
    );

    yield call(refreshAppointmentsAfterChange);
  } catch (error) {
    yield put(
      appointmentActionFailure(
        getErrorMessage(
          error,
          "Failed to update appointment"
        )
      )
    );
  }
}

function* updateAppointmentStatus(action) {
  try {
    const { id, status } = action.payload;

    const result = decryptResponse(
      yield call(
        updateAppointmentStatusAPI,
        id,
        status
      )
    );

    yield put(
      appointmentActionSuccess(result.data)
    );

    yield call(refreshAppointmentsAfterChange);
  } catch (error) {
    yield put(
      appointmentActionFailure(
        getErrorMessage(
          error,
          "Failed to update appointment status"
        )
      )
    );
  }
}

function* cancelAppointment(action) {
  try {
    const result = decryptResponse(
      yield call(
        cancelAppointmentAPI,
        action.payload
      )
    );

    yield put(
      appointmentActionSuccess(result.data)
    );

    yield call(refreshAppointmentsAfterChange);
  } catch (error) {
    yield put(
      appointmentActionFailure(
        getErrorMessage(
          error,
          "Failed to cancel appointment"
        )
      )
    );
  }
}

export default function* appointmentSaga() {
  // takeEvery (not takeLatest): a prefetch and a page change can overlap,
  // and takeLatest would cancel the first and leave it stuck "in flight".
  yield takeEvery(
    fetchAppointmentsRequest.type,
    fetchAppointments
  );

  yield takeLatest(
    fetchAppointmentRequest.type,
    fetchAppointment
  );

  yield takeLatest(
    createAppointmentRequest.type,
    createAppointment
  );

  yield takeLatest(
    updateAppointmentRequest.type,
    updateAppointment
  );

  yield takeLatest(
    updateAppointmentStatusRequest.type,
    updateAppointmentStatus
  );

  yield takeLatest(
    cancelAppointmentRequest.type,
    cancelAppointment
  );
}