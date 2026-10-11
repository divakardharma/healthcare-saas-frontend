import { call, put, takeLatest } from "redux-saga/effects";
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription as createPrescriptionAPI,
  updatePrescription as updatePrescriptionAPI,
  deletePrescription as deletePrescriptionAPI,
  updatePrescriptionStatus as updatePrescriptionStatusAPI
} from "./prescriptionAPI";
import {
  fetchPrescriptions,
  fetchPrescriptionsSuccess,
  fetchPrescriptionsFailure,
  fetchPrescriptionById,
  fetchPrescriptionByIdSuccess,
  fetchPrescriptionByIdFailure,
  createPrescription,
  createPrescriptionSuccess,
  createPrescriptionFailure,
  updatePrescription,
  updatePrescriptionSuccess,
  updatePrescriptionFailure,
  deletePrescription,
  deletePrescriptionSuccess,
  deletePrescriptionFailure,
  updatePrescriptionStatus,
  updatePrescriptionStatusSuccess,
  updatePrescriptionStatusFailure
} from "./prescriptionSlice";
import { decryptData } from "../../services/encryptionService";
function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

function* fetchPrescriptionsSaga() {
  try {
    const response = yield call(getPrescriptions);
    yield put(fetchPrescriptionsSuccess(response.data || response));
  } catch (error) {
    yield put(
      fetchPrescriptionsFailure(
        getErrorMessage(error, "Failed to load prescriptions")
      )
    );
  }
}

function* fetchPrescriptionByIdSaga(action) {
  try {
    const response = yield call(getPrescriptionById, action.payload);
    yield put(fetchPrescriptionByIdSuccess(response.data || response));
  } catch (error) {
    yield put(
      fetchPrescriptionByIdFailure(
        getErrorMessage(error, "Failed to load prescription")
      )
    );
  }
}

function* createPrescriptionSaga(action) {
  try {
    const response = yield call(createPrescriptionAPI, action.payload);
    yield put(createPrescriptionSuccess(response.data || response));
    yield put(fetchPrescriptions());
  } catch (error) {
  if (error.response?.data?.payload) {
    try {
      const backendError = decryptData(error.response.data.payload);
      console.log("PRESCRIPTION BACKEND ERROR:", backendError);
    } catch (decryptError) {
      console.error("Could not decrypt backend error:", decryptError);
    }
  }

  yield put(
    createPrescriptionFailure(
      getErrorMessage(error, "Failed to create prescription")
    )
  );
}
}

function* updatePrescriptionSaga(action) {
  try {
    const { id, data } = action.payload;
    yield call(updatePrescriptionAPI, id, data);
    yield put(updatePrescriptionSuccess());
    yield put(fetchPrescriptions());
  } catch (error) {
    yield put(
      updatePrescriptionFailure(
        getErrorMessage(error, "Failed to update prescription")
      )
    );
  }
}

function* deletePrescriptionSaga(action) {
  try {
    yield call(deletePrescriptionAPI, action.payload);
    yield put(deletePrescriptionSuccess(action.payload));
    yield put(fetchPrescriptions());
  } catch (error) {
    yield put(
      deletePrescriptionFailure(
        getErrorMessage(error, "Failed to delete prescription")
      )
    );
  }
}

function* updatePrescriptionStatusSaga(action) {
  try {
    const { id, data } = action.payload;
    yield call(updatePrescriptionStatusAPI, id, data);
    yield put(updatePrescriptionStatusSuccess());
    yield put(fetchPrescriptions());
  } catch (error) {
    yield put(
      updatePrescriptionStatusFailure(
        getErrorMessage(error, "Failed to update prescription status")
      )
    );
  }
}

export default function* prescriptionSaga() {
  yield takeLatest(fetchPrescriptions.type, fetchPrescriptionsSaga);
  yield takeLatest(fetchPrescriptionById.type, fetchPrescriptionByIdSaga);
  yield takeLatest(createPrescription.type, createPrescriptionSaga);
  yield takeLatest(updatePrescription.type, updatePrescriptionSaga);
  yield takeLatest(deletePrescription.type, deletePrescriptionSaga);
  yield takeLatest(
    updatePrescriptionStatus.type,
    updatePrescriptionStatusSaga
  );
}