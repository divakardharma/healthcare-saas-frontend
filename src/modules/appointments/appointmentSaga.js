import {
  call,
  put,
  select,
  takeEvery,
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
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  invalidateAppointmentBatches,
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

import {
  saveOfflineRecord,
  getOfflineScope,
} from "../../utils/offlineDB";

import {
  isRetryableOfflineError,
} from "../offline/offlineUtils";

import {
  queueItem,
  processQueue,
} from "../offline/offlineSlice";

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

const selectAppointments = (state) =>
  state.appointments;

const selectOfflineScope = (state) =>
  getOfflineScope({
    user: state.auth?.user,
    tenant: state.tenant?.tenant,
  });

/*
 * Save an appointment mutation into
 * the SAME IndexedDB offline queue
 * used by patients.
 */
function* enqueueOfflineAppointment({
  type,
  payload,
  meta,
}) {
  const scope =
    yield select(selectOfflineScope);

  if (!scope) {
    throw new Error(
      "Cannot queue appointment without an authenticated user and tenant scope"
    );
  }

  const record =
    yield call(saveOfflineRecord, {
      type,
      payload,
      meta,
      scope,
    });

  /*
   * Redux stores only lightweight
   * queue information.
   *
   * The actual appointment data is
   * encrypted inside IndexedDB.
   */
  yield put(
    queueItem({
      id: record.id,
      type: record.type,
      meta: record.meta,
      createdAt: record.createdAt,
    })
  );

  return record;
}

// Fetches ONE batch (20 appointments).
function* fetchAppointments(action) {
  const { page, prefetch } =
    action.payload;

  const {
    batches,
    inFlight,
    cacheVersion,
  } =
    yield select(
      selectAppointments
    );

  // Prevent duplicate requests.
  if (
    batches[page] ||
    inFlight[page]
  ) {
    return;
  }

  yield put(
    fetchAppointmentsStart({
      page,
      prefetch,
    })
  );

  try {
    const result =
      decryptResponse(
        yield call(
          getAppointmentsAPI,
          page
        )
      );

    const appointments =
      Array.isArray(result.data)
        ? result.data
        : [];

    const pagination =
      result.pagination || {};

    yield put(
      fetchAppointmentsSuccess({
        page,
        version:
          cacheVersion,
        appointments,
        total:
          Number.isFinite(
            pagination.total
          )
            ? pagination.total
            : appointments.length,
        hasMore:
          Boolean(
            pagination.has_more
          ),
      })
    );
  } catch (error) {
    yield put(
      fetchAppointmentsFailure({
        page,
        version:
          cacheVersion,
        message:
          getErrorMessage(
            error,
            "Failed to fetch appointments"
          ),
      })
    );
  }
}

/*
 * Appointment mutations can move
 * records between backend batches.
 */
function* refreshAppointmentsAfterChange() {
  yield put(
    invalidateAppointmentBatches()
  );

  yield put(
    fetchAppointmentsRequest(1)
  );
}

function* fetchAppointment(action) {
  try {
    const result =
      decryptResponse(
        yield call(
          getAppointmentAPI,
          action.payload
        )
      );

    yield put(
      fetchAppointmentSuccess(
        result.data
      )
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

/*
 * =========================================================
 * CREATE APPOINTMENT
 * =========================================================
 */

function* createAppointment(action) {
  const data =
    action.payload;

  const isOnline =
    yield select(
      (state) =>
        state.offline?.isOnline
    );

  /*
   * Browser is offline.
   *
   * Do NOT call the API.
   */
  if (!isOnline) {
    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "CREATE_APPOINTMENT",

          payload:
            data,

          meta: {
            displayName:
              data?.patient_name ||
              data?.patientName ||
              "New appointment",
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "You are offline. Appointment saved to offline queue and will sync when connection is restored.",
        })
      );
    } catch (error) {
      yield put(
        appointmentActionFailure(
          error.message ||
            "You are offline and the appointment could not be queued."
        )
      );
    }

    return;
  }

  /*
   * Browser is online.
   */
  try {
    const result =
      decryptResponse(
        yield call(
          createAppointmentAPI,
          data
        )
      );

    yield put(
      appointmentActionSuccess(
        result.data
      )
    );

    yield call(
      refreshAppointmentsAfterChange
    );
  } catch (error) {
    /*
     * Validation/auth/permission
     * errors are NOT queued.
     */
    if (
      !isRetryableOfflineError(
        error
      )
    ) {
      yield put(
        appointmentActionFailure(
          getErrorMessage(
            error,
            "Failed to create appointment"
          )
        )
      );

      return;
    }

    /*
     * Network/server failure:
     * preserve the mutation.
     */
    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "CREATE_APPOINTMENT",

          payload:
            data,

          meta: {
            displayName:
              data?.patient_name ||
              data?.patientName ||
              "New appointment",
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "Network error. Appointment saved to offline queue and will sync when connection is restored.",
        })
      );

      yield put(
        processQueue()
      );
    } catch (
      queueError
    ) {
      yield put(
        appointmentActionFailure(
          queueError.message ||
            getErrorMessage(
              error,
              "Failed to create appointment"
            )
        )
      );
    }
  }
}

/*
 * =========================================================
 * UPDATE APPOINTMENT
 * =========================================================
 */

function* updateAppointment(action) {
  const {
    id,
    data,
  } =
    action.payload;

  const isOnline =
    yield select(
      (state) =>
        state.offline?.isOnline
    );

  /*
   * OFFLINE
   */
  if (!isOnline) {
    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "UPDATE_APPOINTMENT",

          payload: {
            id,
            data,
          },

          meta: {
            patientId:
              data?.patient_id ??
              data?.patientId,

            appointmentId:
              id,

            displayName:
              data?.patient_name ||
              data?.patientName ||
              `Appointment #${id}`,
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "You are offline. Appointment update saved to offline queue and will sync when connection is restored.",
        })
      );
    } catch (error) {
      yield put(
        appointmentActionFailure(
          error.message ||
            "You are offline and the appointment update could not be queued."
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
          updateAppointmentAPI,
          id,
          data
        )
      );

    yield put(
      appointmentActionSuccess(
        result.data
      )
    );

    yield call(
      refreshAppointmentsAfterChange
    );
  } catch (error) {
    if (
      !isRetryableOfflineError(
        error
      )
    ) {
      yield put(
        appointmentActionFailure(
          getErrorMessage(
            error,
            "Failed to update appointment"
          )
        )
      );

      return;
    }

    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "UPDATE_APPOINTMENT",

          payload: {
            id,
            data,
          },

          meta: {
            patientId:
              data?.patient_id ??
              data?.patientId,

            appointmentId:
              id,

            displayName:
              data?.patient_name ||
              data?.patientName ||
              `Appointment #${id}`,
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "Network error. Appointment update saved to offline queue and will sync when connection is restored.",
        })
      );

      yield put(
        processQueue()
      );
    } catch (
      queueError
    ) {
      yield put(
        appointmentActionFailure(
          queueError.message ||
            getErrorMessage(
              error,
              "Failed to update appointment"
            )
        )
      );
    }
  }
}

/*
 * =========================================================
 * UPDATE APPOINTMENT STATUS
 * =========================================================
 */

function* updateAppointmentStatus(
  action
) {
  const {
    id,
    status,
  } =
    action.payload;

  const isOnline =
    yield select(
      (state) =>
        state.offline?.isOnline
    );

  /*
   * OFFLINE
   */
  if (!isOnline) {
    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "UPDATE_APPOINTMENT_STATUS",

          payload: {
            id,
            status,
          },

          meta: {
            appointmentId:
              id,

            displayName:
              `Appointment #${id}`,
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "You are offline. Appointment status change saved to offline queue and will sync when connection is restored.",
        })
      );
    } catch (error) {
      yield put(
        appointmentActionFailure(
          error.message ||
            "You are offline and the appointment status change could not be queued."
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
          updateAppointmentStatusAPI,
          id,
          status
        )
      );

    yield put(
      appointmentActionSuccess(
        result.data
      )
    );

    yield call(
      refreshAppointmentsAfterChange
    );
  } catch (error) {
    if (
      !isRetryableOfflineError(
        error
      )
    ) {
      yield put(
        appointmentActionFailure(
          getErrorMessage(
            error,
            "Failed to update appointment status"
          )
        )
      );

      return;
    }

    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "UPDATE_APPOINTMENT_STATUS",

          payload: {
            id,
            status,
          },

          meta: {
            appointmentId:
              id,

            displayName:
              `Appointment #${id}`,
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "Network error. Appointment status change saved to offline queue and will sync when connection is restored.",
        })
      );

      yield put(
        processQueue()
      );
    } catch (
      queueError
    ) {
      yield put(
        appointmentActionFailure(
          queueError.message ||
            getErrorMessage(
              error,
              "Failed to update appointment status"
            )
        )
      );
    }
  }
}

/*
 * =========================================================
 * CANCEL APPOINTMENT
 * =========================================================
 */

function* cancelAppointment(action) {
  const id =
    action.payload;

  const isOnline =
    yield select(
      (state) =>
        state.offline?.isOnline
    );

  /*
   * OFFLINE
   */
  if (!isOnline) {
    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "CANCEL_APPOINTMENT",

          payload: {
            id,
          },

          meta: {
            appointmentId:
              id,

            displayName:
              `Appointment #${id}`,
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "You are offline. Appointment cancellation saved to offline queue and will sync when connection is restored.",
        })
      );
    } catch (error) {
      yield put(
        appointmentActionFailure(
          error.message ||
            "You are offline and the appointment cancellation could not be queued."
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
          cancelAppointmentAPI,
          id
        )
      );

    yield put(
      appointmentActionSuccess(
        result.data
      )
    );

    yield call(
      refreshAppointmentsAfterChange
    );
  } catch (error) {
    if (
      !isRetryableOfflineError(
        error
      )
    ) {
      yield put(
        appointmentActionFailure(
          getErrorMessage(
            error,
            "Failed to cancel appointment"
          )
        )
      );

      return;
    }

    try {
      yield call(
        enqueueOfflineAppointment,
        {
          type:
            "CANCEL_APPOINTMENT",

          payload: {
            id,
          },

          meta: {
            appointmentId:
              id,

            displayName:
              `Appointment #${id}`,
          },
        }
      );

      yield put(
        appointmentActionSuccess({
          offline:
            true,

          message:
            "Network error. Appointment cancellation saved to offline queue and will sync when connection is restored.",
        })
      );

      yield put(
        processQueue()
      );
    } catch (
      queueError
    ) {
      yield put(
        appointmentActionFailure(
          queueError.message ||
            getErrorMessage(
              error,
              "Failed to cancel appointment"
            )
        )
      );
    }
  }
}

export default function* appointmentSaga() {
  /*
   * Pagination/prefetch can overlap.
   */
  yield takeEvery(
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