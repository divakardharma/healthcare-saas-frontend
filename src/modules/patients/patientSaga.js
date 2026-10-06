import {
  call,
  put,
  select,
  takeEvery,
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
  fetchPatientsStart,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  resetPatientBatches,
  fetchPatientRequest,
  fetchPatientSuccess,
  fetchPatientFailure,
  createPatientRequest,
  updatePatientRequest,
  deletePatientRequest,
  patientActionSuccess,
  patientActionFailure,
} from "./patientSlice";

import {
  decryptData,
} from "../../services/encryptionService";

import {
  saveOfflineRecord,
} from "../../utils/offlineDB";

import {
  isRetryableOfflineError,
} from "../offline/offlineUtils";

import {
  queueItem,
  processQueue,
} from "../offline/offlineSlice";

const decryptResponse =
  (response) =>
    decryptData(
      response.data.payload
    );

const getErrorMessage = (
  error,
  fallback
) => {
  try {
    const payload =
      error.response?.data
        ?.payload;

    if (payload) {
      return (
        decryptData(
          payload
        )?.message ||
        fallback
      );
    }
  } catch (_) {}

  return (
    error.response?.data
      ?.message ||
    error.message ||
    fallback
  );
};

const selectPatients = (
  state
) => state.patients;

const selectOfflineScope = (
  state
) => {
  const user =
    state.auth?.user;

  const tenant =
    state.tenant?.tenant;

  const userId =
    user?.id ??
    user?.user_id ??
    user?.email;

  const tenantId =
    tenant?.id ??
    tenant?.tenant_id ??
    tenant?.subdomain ??
    tenant?.name;

  if (
    userId == null ||
    tenantId == null
  ) {
    return null;
  }

  const userKey =
    String(userId).trim();

  const tenantKey =
    String(tenantId).trim();

  if (
    !userKey ||
    !tenantKey
  ) {
    return null;
  }

  return {
    userKey,
    tenantKey,
    scopeKey:
      `${tenantKey}::${userKey}`,
  };
};

/*
 * ---------------------------------------------------------
 * SAVE TO OFFLINE QUEUE
 * ---------------------------------------------------------
 */

function* enqueueOffline({
  type,
  payload,
  meta,
}) {
  try {
    const scope =
      yield select(
        selectOfflineScope
      );

    /*
     * Save encrypted payload
     * into IndexedDB.
     */
    const record =
      yield call(
        saveOfflineRecord,
        {
          type,
          payload,
          meta,
          scope,
        }
      );

    /*
     * Redux only stores
     * lightweight metadata.
     */
    yield put(
      queueItem({
        id:
          record.id,

        type:
          record.type,

        meta:
          record.meta,

        createdAt:
          record.createdAt,
      })
    );

    return true;
  } catch (
    error
  ) {
    console.error(
      "Failed to enqueue offline record:",
      error
    );

    return false;
  }
}

/*
 * ---------------------------------------------------------
 * FETCH PATIENTS
 * ---------------------------------------------------------
 */

function* fetchPatients(
  action
) {
  const {
    page,
    prefetch,
  } =
    action.payload;

  const {
    batches,
    inFlight,
    cacheVersion,
  } =
    yield select(
      selectPatients
    );

  /*
   * Prevent duplicate
   * requests.
   */
  if (
    batches[page] ||
    inFlight[page]
  ) {
    return;
  }

  yield put(
    fetchPatientsStart({
      page,
      prefetch,
    })
  );

  try {
    const result =
      decryptResponse(
        yield call(
          getPatientsAPI,
          page
        )
      );

    const patients =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    const pagination =
      result.pagination ||
      {};

    yield put(
      fetchPatientsSuccess(
        {
          page,
          version:
            cacheVersion,

          patients,

          total:
            Number.isFinite(
              pagination.total
            )
              ? pagination.total
              : patients.length,

          hasMore:
            Boolean(
              pagination.has_more
            ),
        }
      )
    );
  } catch (
    error
  ) {
    yield put(
      fetchPatientsFailure(
        {
          page,

          version:
            cacheVersion,

          message:
            getErrorMessage(
              error,
              "Failed to fetch patients"
            ),
        }
      )
    );
  }
}

/*
 * ---------------------------------------------------------
 * REFRESH PATIENT CACHE
 * ---------------------------------------------------------
 */

function* refreshPatientsAfterChange() {
  yield put(
    resetPatientBatches()
  );

  yield put(
    fetchPatientsRequest(
      1
    )
  );
}

/*
 * ---------------------------------------------------------
 * FETCH SINGLE PATIENT
 * ---------------------------------------------------------
 */

function* fetchPatient(
  action
) {
  try {
    const result =
      decryptResponse(
        yield call(
          getPatientAPI,
          action.payload
        )
      );

    yield put(
      fetchPatientSuccess(
        result.data
      )
    );
  } catch (
    error
  ) {
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

/*
 * ---------------------------------------------------------
 * CREATE PATIENT
 * ---------------------------------------------------------
 */

function* createPatient(
  action
) {
  const data =
    action.payload;

  const isOnline =
    yield select(
      (state) =>
        state.offline
          .isOnline
    );

  /*
   * OFFLINE
   *
   * Never call the API.
   */
  if (!isOnline) {
    const queued =
      yield call(
        enqueueOffline,
        {
          type:
            "CREATE_PATIENT",

          payload:
            data,

          meta: {
            displayName:
              data?.full_name ||
              data?.name ||
              "New patient",
          },
        }
      );

    if (queued) {
      yield put(
        patientActionSuccess(
          {
            offline:
              true,

            message:
              "You are offline. Patient saved to offline queue and will sync when connection is restored.",
          }
        )
      );
    } else {
      yield put(
        patientActionFailure(
          "You are offline and the offline queue could not be written."
        )
      );
    }

    return;
  }

  /*
   * ONLINE
   */

  try {
    const result =
      decryptResponse(
        yield call(
          createPatientAPI,
          data
        )
      );

    yield put(
      patientActionSuccess(
        result.data
      )
    );

    yield call(
      refreshPatientsAfterChange
    );
  } catch (
    error
  ) {
    /*
     * Validation/auth/permission errors
     * are not offline failures.
     */
    if (
      !isRetryableOfflineError(
        error
      )
    ) {
      yield put(
        patientActionFailure(
          getErrorMessage(
            error,
            "Failed to create patient"
          )
        )
      );

      return;
    }

    /*
     * Retryable API/network failure
     * while browser still reports online.
     *
     * Preserve mutation in IndexedDB.
     */
    const queued =
      yield call(
        enqueueOffline,
        {
          type:
            "CREATE_PATIENT",

          payload:
            data,

          meta: {
            displayName:
              data?.full_name ||
              data?.name ||
              "New patient",
          },
        }
      );

    if (queued) {
      yield put(
        patientActionSuccess(
          {
            offline:
              true,

            message:
              "Network error. Patient saved to offline queue and will sync when connection is restored.",
          }
        )
      );

      /*
       * The queue processor is protected by
       * takeLeading, so this is safe.
       */
      yield put(
        processQueue()
      );
    } else {
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
}

/*
 * ---------------------------------------------------------
 * UPDATE PATIENT
 * ---------------------------------------------------------
 */

function* updatePatient(
  action
) {
  const {
    id,
    data,
  } =
    action.payload;

  const isOnline =
    yield select(
      (state) =>
        state.offline
          .isOnline
    );

  /*
   * OFFLINE
   */
  if (!isOnline) {
    const queued =
      yield call(
        enqueueOffline,
        {
          type:
            "UPDATE_PATIENT",

          payload: {
            id,
            data,
          },

          meta: {
            displayName:
              data?.full_name ||
              data?.name ||
              `Patient #${id}`,

            patientId:
              id,
          },
        }
      );

    if (queued) {
      yield put(
        patientActionSuccess(
          {
            offline:
              true,

            message:
              "You are offline. Update saved to offline queue and will sync when connection is restored.",
          }
        )
      );
    } else {
      yield put(
        patientActionFailure(
          "You are offline and the offline queue could not be written."
        )
      );
    }

    return;
  }

  /*
   * ONLINE
   */

  try {
    const result =
      decryptResponse(
        yield call(
          updatePatientAPI,
          id,
          data
        )
      );

    yield put(
      patientActionSuccess(
        result.data
      )
    );

    yield call(
      refreshPatientsAfterChange
    );
  } catch (
    error
  ) {
    /*
     * Validation/auth/permission errors
     * must not enter the offline queue.
     */
    if (
      !isRetryableOfflineError(
        error
      )
    ) {
      yield put(
        patientActionFailure(
          getErrorMessage(
            error,
            "Failed to update patient"
          )
        )
      );

      return;
    }

    /*
     * Retryable API/network failure
     * goes to IndexedDB.
     */
    const queued =
      yield call(
        enqueueOffline,
        {
          type:
            "UPDATE_PATIENT",

          payload: {
            id,
            data,
          },

          meta: {
            displayName:
              data?.full_name ||
              data?.name ||
              `Patient #${id}`,

            patientId:
              id,
          },
        }
      );

    if (queued) {
      yield put(
        patientActionSuccess(
          {
            offline:
              true,

            message:
              "Network error. Update saved to offline queue and will sync when connection is restored.",
          }
        )
      );

      yield put(
        processQueue()
      );
    } else {
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
}

/*
 * ---------------------------------------------------------
 * DELETE PATIENT
 * ---------------------------------------------------------
 */

function* deletePatient(
  action
) {
  try {
    yield call(
      deletePatientAPI,
      action.payload
    );

    yield put(
      patientActionSuccess({})
    );

    yield call(
      refreshPatientsAfterChange
    );
  } catch (
    error
  ) {
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

/*
 * ---------------------------------------------------------
 * PATIENT SAGA
 * ---------------------------------------------------------
 */

export default function* patientSaga() {
  /*
   * takeEvery for pagination:
   * prefetch and page requests
   * can legitimately overlap.
   */
  yield takeEvery(
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