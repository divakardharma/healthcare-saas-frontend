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
    let errorMessage = "Failed to fetch tenant configuration";

    try {
      const encryptedPayload = error.response?.data?.payload;

      if (encryptedPayload) {
        const decryptedError = decryptData(encryptedPayload);

        errorMessage =
          decryptedError?.message ||
          errorMessage;
      } else {
        errorMessage =
          error.response?.data?.message ||
          errorMessage;
      }
    } catch (decryptError) {
      errorMessage = "Failed to fetch tenant configuration";
    }

    yield put(fetchTenantFailure(errorMessage));
  }
}

function* handleRegisterTenant(action) {
 try {
    const response = yield call(registerTenantAPI, action.payload);

    const decryptedData = decryptData(response.data.payload);

    yield put(registerTenantSuccess(decryptedData.data));
  } catch (error) {
    let errorMessage = "Tenant registration failed";

    try {
      const encryptedPayload = error.response?.data?.payload;

      if (encryptedPayload) {
        const decryptedError = decryptData(encryptedPayload);

        console.log("Tenant Registration Error:", decryptedError);

        errorMessage =
          decryptedError?.message ||
          errorMessage;
      } else {
        errorMessage =
          error.response?.data?.message ||
          errorMessage;
      }
    } catch (decryptError) {
      errorMessage = "Tenant registration failed";
    }

    yield put(registerTenantFailure(errorMessage));
  }
}

function* tenantSaga() {
  yield takeLatest(fetchTenantRequest.type, handleFetchTenant);
  yield takeLatest(registerTenantRequest.type, handleRegisterTenant);
}

export default tenantSaga;