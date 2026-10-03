import { call, put, takeLatest } from "redux-saga/effects";

import {
  getUsersAPI,
  getUserAPI,
  createUserAPI,
  updateUserAPI,
  assignRoleAPI,
  removeRoleAPI,
  deleteUserAPI,
} from "./userAPI";

import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFailure,
  createUserRequest,
  updateUserRequest,
  assignRoleRequest,
  removeRoleRequest,
  deleteUserRequest,
  userActionSuccess,
  userActionFailure,
} from "./userSlice";

import { decryptData } from "../../services/encryptionService";

const decryptResponse = (response) =>
  decryptData(response.data.payload);

const getErrorMessage = (error, fallback) => {
  try {
    const payload = error.response?.data?.payload;

    if (payload) {
      return decryptData(payload)?.message || fallback;
    }
  } catch (_) {}

  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

function* fetchUsers(action) {
  try {
    const response = yield call(
      getUsersAPI,
      action.payload?.role
    );

    const result = decryptResponse(response);

    yield put(
      fetchUsersSuccess(
        Array.isArray(result.data) ? result.data : []
      )
    );
  } catch (error) {
    yield put(
      fetchUsersFailure(
        getErrorMessage(error, "Failed to fetch users")
      )
    );
  }
}

function* fetchUser(action) {
  try {
    const response = yield call(
      getUserAPI,
      action.payload
    );

    const result = decryptResponse(response);

    yield put(fetchUserSuccess(result.data));
  } catch (error) {
    yield put(
      fetchUserFailure(
        getErrorMessage(error, "Failed to fetch user")
      )
    );
  }
}

function* createUser(action) {
  try {
    const response = yield call(
      createUserAPI,
      action.payload
    );

    const result = decryptResponse(response);

    yield put(userActionSuccess(result.data));
    yield put(fetchUsersRequest());
  } catch (error) {
    yield put(
      userActionFailure(
        getErrorMessage(error, "Failed to create user")
      )
    );
  }
}

function* updateUser(action) {
  try {
    const { id, data } = action.payload;

    const response = yield call(
      updateUserAPI,
      id,
      data
    );

    const result = decryptResponse(response);

    yield put(userActionSuccess(result.data));
    yield put(fetchUsersRequest());
  } catch (error) {
    yield put(
      userActionFailure(
        getErrorMessage(error, "Failed to update user")
      )
    );
  }
}

function* assignRole(action) {
  try {
    const { id, role } = action.payload;

    const response = yield call(
      assignRoleAPI,
      id,
      role
    );

    const result = decryptResponse(response);

    yield put(userActionSuccess(result.data));
    yield put(fetchUsersRequest());
  } catch (error) {
    yield put(
      userActionFailure(
        getErrorMessage(error, "Failed to assign role")
      )
    );
  }
}

function* removeRole(action) {
  try {
    const { id, role } = action.payload;

    const response = yield call(
      removeRoleAPI,
      id,
      role
    );

    const result = decryptResponse(response);

    yield put(userActionSuccess(result.data));
    yield put(fetchUsersRequest());
  } catch (error) {
    yield put(
      userActionFailure(
        getErrorMessage(error, "Failed to remove role")
      )
    );
  }
}

function* deleteUser(action) {
  try {
    yield call(deleteUserAPI, action.payload);

    yield put(userActionSuccess({}));
    yield put(fetchUsersRequest());
  } catch (error) {
    yield put(
      userActionFailure(
        getErrorMessage(error, "Failed to delete user")
      )
    );
  }
}

export default function* userSaga() {
  yield takeLatest(
    fetchUsersRequest.type,
    fetchUsers
  );

  yield takeLatest(
    fetchUserRequest.type,
    fetchUser
  );

  yield takeLatest(
    createUserRequest.type,
    createUser
  );

  yield takeLatest(
    updateUserRequest.type,
    updateUser
  );

  yield takeLatest(
    assignRoleRequest.type,
    assignRole
  );

  yield takeLatest(
    removeRoleRequest.type,
    removeRole
  );

  yield takeLatest(
    deleteUserRequest.type,
    deleteUser
  );
}