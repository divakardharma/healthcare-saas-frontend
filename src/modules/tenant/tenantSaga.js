import { call, put, takeLatest } from "redux-saga/effects";
import { fetchTenantConfig } from "./tenantAPI";
import {
  fetchTenantRequest,
  fetchTenantSuccess,
  fetchTenantFailure,
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

function* tenantSaga() {
  yield takeLatest(fetchTenantRequest.type, handleFetchTenant);
}

export default tenantSaga;