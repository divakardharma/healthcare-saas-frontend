import { call, put, takeLatest } from "redux-saga/effects";
import { loginAPI, refreshTokenAPI , logoutAPI,  getCsrfToken, } from "./authAPI";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshRequest,
  refreshSuccess,
  refreshFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
} from "./authSlice";
import { decryptData } from "../../services/encryptionService";
import tokenService from "../../services/tokenService";

function* handleLogin(action) {
  try {
    const response = yield call(loginAPI, action.payload);

    const decryptedData = decryptData(response.data.payload);

    // console.log("Decrypted Login Response:", decryptedData);

    const { user, access_token, csrf_token } = decryptedData.data;

    // Access token store
    tokenService.setAccessToken(access_token);

    // Login success-la backend rotate panna new CSRF token store
    tokenService.setCsrfToken(csrf_token);

    // Redux state update
    yield put(
      loginSuccess({
        user: user,
        accessToken: access_token,
      })
    );


  } catch (error) {
    // console.error("Login Error:", error);

    yield put(
      loginFailure(
        error.response?.data?.message ||
        error.message ||
        "Login failed"
      )
    );
  }
}

function* handleRefresh() {
  try {
    const response = yield call(refreshTokenAPI);

    const decryptedData = decryptData(response.data.payload);

    const { access_token, csrf_token } = decryptedData.data;

    tokenService.setAccessToken(access_token);
    tokenService.setCsrfToken(csrf_token);

    yield put(
      refreshSuccess({
        accessToken: access_token,
      })
    );

  } catch (error) {
    // tokenService.clearTokens();

    yield put(refreshFailure());
  }
}


function* handleLogout() {
  try {
    yield call(logoutAPI);

    tokenService.clearTokens();

    // Get a fresh CSRF token for the next login
    const response = yield call(getCsrfToken);

    const decryptedData = decryptData(response.data.payload);

    const newCsrfToken = decryptedData.data.csrf_token;

    tokenService.setCsrfToken(newCsrfToken);

    yield put(logoutSuccess());

  } catch (error) {
    yield put(
      logoutFailure(
        error.response?.data?.message ||
        error.message ||
        "Logout failed"
      )
    );
  }
}


function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(refreshRequest.type, handleRefresh);
  yield takeLatest(logoutRequest.type, handleLogout);
}

export default authSaga;