import {
  call,
  put,
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
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
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

function* fetchAppointments() {
  try {
    const result = decryptResponse(
      yield call(getAppointmentsAPI)
    );

    yield put(
      fetchAppointmentsSuccess(
        Array.isArray(result.data)
          ? result.data
          : []
      )
    );
  } catch (error) {
    yield put(
      fetchAppointmentsFailure(
        getErrorMessage(
          error,
          "Failed to fetch appointments"
        )
      )
    );
  }
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

    yield put(fetchAppointmentsRequest());
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

    yield put(fetchAppointmentsRequest());
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

    yield put(fetchAppointmentsRequest());
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

    yield put(fetchAppointmentsRequest());
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
  yield takeLatest(
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