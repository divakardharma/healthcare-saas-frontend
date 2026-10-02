import { call, put, takeLatest } from "redux-saga/effects";
import { fetchTenantConfig, registerTenantAPI } from "./tenantAPI";
import {
  fetchTenantRequest,
  fetchTenantSuccess,
  fetchTenantFailure,
  registerTenantRequest,
  registerTenantSuccess,
  registerTenantFailure,
} from "./tenantSlice";
import { decryptData } from "../../services/encryptionService";

function* handleFetchTenant() {
  try {
    const response = yield call(fetchTenantConfig);

    const decryptedData = decryptData(response.data.payload);

    yield put(fetchTenantSuccess(decryptedData.data));
  } catch (error) {
    yield put(
      fetchTenantFailure(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch tenant configuration"
      )
    );
  }
}

function* handleRegisterTenant(action) {
  try {
    const response = yield call(registerTenantAPI, action.payload);

    const decryptedData = decryptData(response.data.payload);

    yield put(registerTenantSuccess(decryptedData.data));
  } catch (error) {
    yield put(
      registerTenantFailure(
        error.response?.data?.message ||
          error.message ||
          "Tenant registration failed"
      )
    );
  }
}

function* tenantSaga() {
  yield takeLatest(fetchTenantRequest.type, handleFetchTenant);
  yield takeLatest(registerTenantRequest.type, handleRegisterTenant);
}

export default tenantSaga;