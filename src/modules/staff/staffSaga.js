import { call, put, takeLatest } from "redux-saga/effects";
import {
  getStaff,
  updateStaffRole as updateStaffRoleAPI,
  updateStaffStatus as updateStaffStatusAPI
} from "./staffAPI";
import { decryptData } from "../../services/encryptionService";
import {
  fetchStaff,
  fetchStaffSuccess,
  fetchStaffFailure,
  updateStaffRole,
  updateStaffRoleSuccess,
  updateStaffRoleFailure,
  updateStaffStatus,
  updateStaffStatusSuccess,
  updateStaffStatusFailure
} from "./staffSlice";

const getErrorMessage = (error, defaultMessage) => {
  try {
    const encryptedPayload = error.response?.data?.payload;

    if (encryptedPayload) {
      const decryptedError = decryptData(encryptedPayload);

      return (
        decryptedError?.message ||
        decryptedError?.error ||
        defaultMessage
      );
    }

    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      defaultMessage
    );
  } catch (decryptError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      defaultMessage
    );
  }
};

function* fetchStaffSaga() {
  try {
    const response = yield call(getStaff);
    yield put(fetchStaffSuccess(response));
  } catch (error) {
    yield put(
      fetchStaffFailure(
        getErrorMessage(error, "Failed to load staff")
      )
    );
  }
}

function* updateStaffRoleSaga(action) {
  try {
    const { staffId, userId, roleId, status } = action.payload;

    const response = yield call(
      updateStaffRoleAPI,
      staffId,
      {
        user_id: userId,
        role_id: roleId,
        status
      }
    );

    yield put(updateStaffRoleSuccess(response));
    yield put(fetchStaff());
  } catch (error) {
    yield put(
      updateStaffRoleFailure(
        getErrorMessage(error, "Failed to update staff role")
      )
    );
  }
}

function* updateStaffStatusSaga(action) {
  try {
    const { staffId, status } = action.payload;

    const response = yield call(
      updateStaffStatusAPI,
      staffId,
      status
    );

    yield put(updateStaffStatusSuccess(response));
    yield put(fetchStaff());
  } catch (error) {
    yield put(
      updateStaffStatusFailure(
        getErrorMessage(error, "Failed to update staff status")
      )
    );
  }
}

export default function* staffSaga() {
  yield takeLatest(fetchStaff.type, fetchStaffSaga);
  yield takeLatest(updateStaffRole.type, updateStaffRoleSaga);
  yield takeLatest(updateStaffStatus.type, updateStaffStatusSaga);
}