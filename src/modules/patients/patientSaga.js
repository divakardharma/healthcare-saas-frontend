import {
  call,
  put,
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
  fetchPatientsSuccess,
  fetchPatientsFailure,
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

function* fetchPatients() {
  try {
    const result = decryptResponse(
      yield call(getPatientsAPI)
    );

    yield put(
      fetchPatientsSuccess(
        Array.isArray(result.data)
          ? result.data
          : []
      )
    );
  } catch (error) {
    yield put(
      fetchPatientsFailure(
        getErrorMessage(
          error,
          "Failed to fetch patients"
        )
      )
    );
  }
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

    yield put(fetchPatientsRequest());
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

    yield put(fetchPatientsRequest());
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
    yield put(fetchPatientsRequest());
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
  yield takeLatest(
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