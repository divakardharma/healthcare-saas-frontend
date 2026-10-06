import {
  call,
  put,
  take,
  takeLeading,
  takeEvery,
  fork,
  select,
  delay,
} from "redux-saga/effects";

import {
  eventChannel,
} from "redux-saga";

import {
  setOnlineStatus,
  setOfflineQueue,
  removeFromQueue,
  setProcessingQueue,
  setLastProcessError,
  LOAD_OFFLINE_QUEUE,
  PROCESS_QUEUE,
} from "./offlineSlice";

import {
  getAllOfflineRecords,
  decryptOfflineRecord,
  deleteOfflineRecord,
  getOfflineScope,
} from "../../utils/offlineDB";

import {
  createPatientAPI,
  updatePatientAPI,
} from "../patients/patientAPI";

import {
  createAppointmentAPI,
  updateAppointmentAPI,
  updateAppointmentStatusAPI,
  cancelAppointmentAPI,
} from "../appointments/appointmentAPI";

import {
  patientActionSuccess,
  resetPatientBatches,
  fetchPatientsRequest,
} from "../patients/patientSlice";

import {
  appointmentActionSuccess,
  invalidateAppointmentBatches,
  fetchAppointmentsRequest,
} from "../appointments/appointmentSlice";

import {
  loginSuccess,
  refreshSuccess,
  logoutSuccess,
} from "../auth/authSlice";

import {
  decryptData,
} from "../../services/encryptionService";

import {
  isRetryableOfflineError,
} from "./offlineUtils";

const selectOfflineScope =
  (state) =>
    getOfflineScope({
      user:
        state.auth?.user,

      tenant:
        state.tenant?.tenant,
    });

const toQueueItem =
  (record) => ({
    id:
      record.id,

    type:
      record.type,

    meta:
      record.meta || {},

    createdAt:
      record.createdAt,
  });

function createNetworkChannel() {
  return eventChannel(
    (emitter) => {
      const onlineHandler =
        () =>
          emitter({
            online:
              true,
          });

      const offlineHandler =
        () =>
          emitter({
            online:
              false,
          });

      window.addEventListener(
        "online",
        onlineHandler
      );

      window.addEventListener(
        "offline",
        offlineHandler
      );

      emitter({
        online:
          navigator.onLine,
      });

      return () => {
        window.removeEventListener(
          "online",
          onlineHandler
        );

        window.removeEventListener(
          "offline",
          offlineHandler
        );
      };
    }
  );
}

function* watchNetworkStatus() {
  const channel =
    yield call(
      createNetworkChannel
    );

  try {
    while (true) {
      const {
        online,
      } =
        yield take(channel);

      yield put(
        setOnlineStatus(
          online
        )
      );

      if (online) {
        /*
         * Allow the browser connection
         * to settle before processing.
         */
        yield delay(500);

        yield put({
          type:
            PROCESS_QUEUE,
        });
      }
    }
  } finally {
    channel.close();
  }
}

function* loadOfflineQueueSaga() {
  try {
    const scope =
      yield select(
        selectOfflineScope
      );

    /*
     * No authenticated scope =
     * no queue displayed/processed.
     */
    if (!scope) {
      yield put(
        setOfflineQueue([])
      );

      return;
    }

    const records =
      yield call(
        getAllOfflineRecords,
        scope
      );

    yield put(
      setOfflineQueue(
        records.map(
          toQueueItem
        )
      )
    );

    if (
      navigator.onLine &&
      records.length > 0
    ) {
      yield put({
        type:
          PROCESS_QUEUE,
      });
    }
  } catch (
    error
  ) {
    console.error(
      "Failed to load offline queue:",
      error
    );

    yield put(
      setOfflineQueue([])
    );

    yield put(
      setLastProcessError(
        error?.message ||
          "Failed to load offline queue"
      )
    );
  }
}

/*
 * =========================================================
 * REPLAY ONE QUEUE RECORD
 * =========================================================
 *
 * Patient and appointment mutations all use
 * the SAME encrypted IndexedDB queue.
 */

function* replayRecord(
  record
) {
  const payload =
    yield call(
      decryptOfflineRecord,
      record
    );

  let response;
  let result;

  /*
   * -------------------------
   * PATIENT CREATE
   * -------------------------
   */

  if (
    record.type ===
    "CREATE_PATIENT"
  ) {
    response =
      yield call(
        createPatientAPI,
        payload
      );

    result =
      decryptData(
        response.data.payload
      );

    return {
      resource:
        "patient",

      result,
    };
  }

  /*
   * -------------------------
   * PATIENT UPDATE
   * -------------------------
   */

  if (
    record.type ===
    "UPDATE_PATIENT"
  ) {
    const {
      id,
      data,
    } =
      payload;

    response =
      yield call(
        updatePatientAPI,
        id,
        data
      );

    result =
      decryptData(
        response.data.payload
      );

    return {
      resource:
        "patient",

      result,
    };
  }

  /*
   * -------------------------
   * APPOINTMENT CREATE
   * -------------------------
   */

  if (
    record.type ===
    "CREATE_APPOINTMENT"
  ) {
    response =
      yield call(
        createAppointmentAPI,
        payload
      );

    result =
      decryptData(
        response.data.payload
      );

    return {
      resource:
        "appointment",

      result,
    };
  }

  /*
   * -------------------------
   * APPOINTMENT UPDATE
   * -------------------------
   */

  if (
    record.type ===
    "UPDATE_APPOINTMENT"
  ) {
    const {
      id,
      data,
    } =
      payload;

    response =
      yield call(
        updateAppointmentAPI,
        id,
        data
      );

    result =
      decryptData(
        response.data.payload
      );

    return {
      resource:
        "appointment",

      result,
    };
  }

  /*
   * -------------------------
   * APPOINTMENT STATUS
   * -------------------------
   */

  if (
    record.type ===
    "UPDATE_APPOINTMENT_STATUS"
  ) {
    const {
      id,
      status,
    } =
      payload;

    response =
      yield call(
        updateAppointmentStatusAPI,
        id,
        status
      );

    result =
      decryptData(
        response.data.payload
      );

    return {
      resource:
        "appointment",

      result,
    };
  }

  /*
   * -------------------------
   * APPOINTMENT CANCEL
   * -------------------------
   */

  if (
    record.type ===
    "CANCEL_APPOINTMENT"
  ) {
    const {
      id,
    } =
      payload;

    response =
      yield call(
        cancelAppointmentAPI,
        id
      );

    /*
     * Most APIs return an encrypted payload.
     * This fallback also supports a plain response body.
     */
    result =
      response?.data?.payload
        ? decryptData(
            response.data.payload
          )
        : response?.data;

    return {
      resource:
        "appointment",

      result,
    };
  }

  throw new Error(
    `Unsupported offline queue type: ${record.type}`
  );
}

/*
 * =========================================================
 * PROCESS QUEUE
 * =========================================================
 */

function* processQueueSaga() {
  const isOnline =
    yield select(
      (state) =>
        state.offline
          .isOnline
    );

  const scope =
    yield select(
      selectOfflineScope
    );

  if (
    !isOnline ||
    !scope
  ) {
    return;
  }

  yield put(
    setProcessingQueue(
      true
    )
  );

  yield put(
    setLastProcessError(
      null
    )
  );

  try {
    const records =
      yield call(
        getAllOfflineRecords,
        scope
      );

    if (
      !records.length
    ) {
      yield put(
        setOfflineQueue([])
      );

      return;
    }

    /*
     * Keep Redux queue synchronized
     * with IndexedDB.
     */
    yield put(
      setOfflineQueue(
        records.map(
          toQueueItem
        )
      )
    );

    /*
     * FIFO.
     *
     * The first failed record blocks
     * later records from overtaking it.
     */
    for (
      const record of records
    ) {
      const stillOnline =
        yield select(
          (state) =>
            state.offline
              .isOnline
        );

      const currentScope =
        yield select(
          selectOfflineScope
        );

      /*
       * Stop if connectivity or
       * authenticated scope changed.
       */
      if (
        !stillOnline ||
        !currentScope ||
        currentScope.scopeKey !==
          scope.scopeKey
      ) {
        break;
      }

      let synced =
        false;

      let lastError =
        null;

      /*
       * Maximum 3 attempts:
       *
       * 1 initial attempt
       * 2 retries
       */
      for (
        let attempt = 0;
        attempt < 3 &&
        !synced;
        attempt += 1
      ) {
        try {
          const apiResult =
            yield call(
              replayRecord,
              record
            );

          /*
           * IMPORTANT:
           *
           * Delete from IndexedDB ONLY
           * after the API succeeds.
           */
          yield call(
            deleteOfflineRecord,
            record.id
          );

          yield put(
            removeFromQueue(
              record.id
            )
          );

          /*
           * -------------------------
           * PATIENT SUCCESS
           * -------------------------
           */

          if (
            apiResult.resource ===
            "patient"
          ) {
            if (
              apiResult.result
            ) {
              yield put(
                patientActionSuccess(
                  apiResult.result
                )
              );
            }

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
           * -------------------------
           * APPOINTMENT SUCCESS
           * -------------------------
           */

          if (
            apiResult.resource ===
            "appointment"
          ) {
            if (
              apiResult.result
            ) {
              yield put(
                appointmentActionSuccess(
                  apiResult.result
                )
              );
            }

            /*
             * Appointment mutations can
             * change which backend batch
             * contains an appointment.
             */
            yield put(
              invalidateAppointmentBatches()
            );

            yield put(
              fetchAppointmentsRequest(
                1
              )
            );
          }

          synced =
            true;
        } catch (
          itemError
        ) {
          lastError =
            itemError;

          /*
           * Permanent errors should
           * NOT retry forever.
           */
          if (
            !isRetryableOfflineError(
              itemError
            ) ||
            attempt === 2
          ) {
            break;
          }

          const onlineAfterError =
            yield select(
              (state) =>
                state.offline
                  .isOnline
            );

          if (
            !onlineAfterError
          ) {
            break;
          }

          /*
           * Exponential backoff:
           *
           * attempt 0 -> 500ms
           * attempt 1 -> 1000ms
           */
          yield delay(
            500 *
              2 ** attempt
          );
        }
      }

      /*
       * Failed queue record stays in
       * IndexedDB.
       *
       * Later records do not overtake it.
       */
      if (!synced) {
        console.error(
          "Failed to sync offline record",
          record.id,
          lastError
        );

        yield put(
          setLastProcessError(
            lastError?.message ||
              "Failed to sync offline item"
          )
        );

        break;
      }
    }
  } catch (
    error
  ) {
    console.error(
      "processQueueSaga error:",
      error
    );

    yield put(
      setLastProcessError(
        error?.message ||
          "Failed to process offline queue"
      )
    );
  } finally {
    yield put(
      setProcessingQueue(
        false
      )
    );
  }
}

export default function* offlineSaga() {
  /*
   * Browser online/offline events.
   */
  yield fork(
    watchNetworkStatus
  );

  /*
   * Initial queue load.
   */
  yield takeEvery(
    LOAD_OFFLINE_QUEUE,
    loadOfflineQueueSaga
  );

  /*
   * Reload correct queue after
   * authentication changes.
   */
  yield takeEvery(
    loginSuccess.type,
    loadOfflineQueueSaga
  );

  yield takeEvery(
    refreshSuccess.type,
    loadOfflineQueueSaga
  );

  /*
   * Clear Redux queue view on logout.
   */
  yield takeEvery(
    logoutSuccess.type,
    function* handleLogoutQueueReset() {
      yield put(
        setOfflineQueue([])
      );

      yield put(
        setLastProcessError(
          null
        )
      );

      yield put(
        setProcessingQueue(
          false
        )
      );
    }
  );

  /*
   * Only ONE queue processor can
   * execute at a time.
   */
  yield takeLeading(
    PROCESS_QUEUE,
    processQueueSaga
  );

  /*
   * Startup queue load.
   */
  yield put({
    type:
      LOAD_OFFLINE_QUEUE,
  });
}