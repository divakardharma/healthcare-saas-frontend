import {
  createSlice,
} from "@reduxjs/toolkit";

/*
 * Redux contains only lightweight queue information.
 *
 * The actual sensitive encrypted payload
 * remains inside IndexedDB.
 */

const initialState = {
  isOnline:
    typeof navigator !==
    "undefined"
      ? navigator.onLine
      : true,

  offlineQueue: [],

  isProcessingQueue: false,

  lastProcessError: null,
};

const offlineSlice =
  createSlice({
    name: "offline",

    initialState,

    reducers: {
      setOnlineStatus: (
        state,
        action
      ) => {
        state.isOnline =
          Boolean(
            action.payload
          );
      },

      setOfflineQueue: (
        state,
        action
      ) => {
        state.offlineQueue =
          Array.isArray(
            action.payload
          )
            ? action.payload
            : [];
      },

      queueItem: (
        state,
        action
      ) => {
        const item =
          action.payload;

        /*
         * Prevent duplicate
         * queue entries.
         */
        if (
          !state.offlineQueue.some(
            (
              itemInQueue
            ) =>
              itemInQueue.id ===
              item.id
          )
        ) {
          state.offlineQueue.push(
            item
          );
        }
      },

      removeFromQueue: (
        state,
        action
      ) => {
        const id =
          action.payload;

        state.offlineQueue =
          state.offlineQueue.filter(
            (item) =>
              item.id !== id
          );
      },

      setProcessingQueue: (
        state,
        action
      ) => {
        state.isProcessingQueue =
          Boolean(
            action.payload
          );
      },

      setLastProcessError: (
        state,
        action
      ) => {
        state.lastProcessError =
          action.payload ||
          null;
      },

      clearLastProcessError: (
        state
      ) => {
        state.lastProcessError =
          null;
      },
    },
  });

export const {
  setOnlineStatus,
  setOfflineQueue,
  queueItem,
  removeFromQueue,
  setProcessingQueue,
  setLastProcessError,
  clearLastProcessError,
} =
  offlineSlice.actions;

/*
 * Saga trigger actions.
 */

export const LOAD_OFFLINE_QUEUE =
  "offline/LOAD_OFFLINE_QUEUE";

export const PROCESS_QUEUE =
  "offline/PROCESS_QUEUE";

export const loadOfflineQueue =
  () => ({
    type:
      LOAD_OFFLINE_QUEUE,
  });

export const processQueue =
  () => ({
    type:
      PROCESS_QUEUE,
  });

export default
  offlineSlice.reducer;