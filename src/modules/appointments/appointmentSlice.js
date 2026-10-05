import { createSlice } from "@reduxjs/toolkit";

import { loginSuccess, logoutSuccess } from "../auth/authSlice";

const initialState = {
  // Flattened view of every cached batch.
  appointments: [],

  // Server batches (20 appointments each), keyed by batch/page number.
  batches: {},
  // Batches with a request currently running: { [page]: true }
  inFlight: {},
  // Failed batch requests: { [page]: "message" }
  batchErrors: {},
  // Batches a user is actively waiting for (drives `loading`/`error`).
  blocking: {},

  total: 0,
  hasMore: false,

  // Bumped whenever the cache is cleared. Responses that started under an
  // older version are discarded so they can never re-fill a cleared cache.
  cacheVersion: 0,

  selectedAppointment: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const flattenBatches = (batches) =>
  Object.keys(batches)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((page) => batches[page]);

// Clears the list cache only. selectedAppointment / actionLoading / error are
// deliberately left alone.
const resetBatchCache = (state) => {
  state.appointments = [];
  state.batches = {};
  state.inFlight = {};
  state.batchErrors = {};
  state.blocking = {};
  state.total = 0;
  state.hasMore = false;
  state.loading = false;
  state.cacheVersion += 1;
};

const appointmentSlice = createSlice({
  name: "appointments",

  initialState,

  reducers: {
    // Ask for one batch. `fetchAppointmentsRequest()` still means "batch 1".
    // A non-prefetch request for a batch that is not cached is one the
    // user is waiting on, so it drives `loading` / `error`.
    fetchAppointmentsRequest: {
      reducer: (state, action) => {
        const { page, prefetch } = action.payload;

        if (!prefetch && !state.batches[page]) {
          state.blocking[page] = true;
          state.loading = true;
          state.error = null;
        }
      },

      prepare: (page = 1, options = {}) => ({
        payload: { page, prefetch: Boolean(options.prefetch) },
      }),
    },

    // Dispatched by the saga right before the API call.
    fetchAppointmentsStart: (state, action) => {
      const { page } = action.payload;

      state.inFlight[page] = true;
      delete state.batchErrors[page];
    },

    fetchAppointmentsSuccess: (state, action) => {
      const { page, appointments, total, hasMore, version } =
        action.payload;

      if (version !== state.cacheVersion) {
        return;
      }

      delete state.inFlight[page];
      delete state.batchErrors[page];
      delete state.blocking[page];

      state.batches[page] = appointments;
      state.appointments = flattenBatches(state.batches);
      state.total = total;

      // hasMore describes the newest batch only.
      const newest = Math.max(
        ...Object.keys(state.batches).map(Number)
      );

      if (page >= newest) {
        state.hasMore = hasMore;
      }

      state.loading = Object.keys(state.blocking).length > 0;
    },

    fetchAppointmentsFailure: (state, action) => {
      const { page, message, version } = action.payload;

      if (version !== state.cacheVersion) {
        return;
      }

      delete state.inFlight[page];
      state.batchErrors[page] = message;

      if (state.blocking[page]) {
        delete state.blocking[page];
        state.error = message;
      }

      state.loading = Object.keys(state.blocking).length > 0;
    },

    // Drop every cached batch (after create/update/status/cancel, logout, login).
    invalidateAppointmentBatches: (state) => {
      resetBatchCache(state);
    },

    fetchAppointmentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchAppointmentSuccess: (state, action) => {
      state.loading = false;
      state.selectedAppointment =
        action.payload;
    },

    fetchAppointmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    updateAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    updateAppointmentStatusRequest: (
      state
    ) => {
      state.actionLoading = true;
      state.error = null;
    },

    cancelAppointmentRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    appointmentActionSuccess: (
      state,
      action
    ) => {
      state.actionLoading = false;

      if (action.payload?.id) {
        const index =
          state.appointments.findIndex(
            (appointment) =>
              appointment.id === action.payload.id
          );

        if (index >= 0) {
          state.appointments[index] =
            action.payload;
        }

        state.selectedAppointment =
          action.payload;
      }
    },

    appointmentActionFailure: (
      state,
      action
    ) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    clearAppointmentError: (state) => {
      state.error = null;
    },
  },

  // Cached appointments belong to one signed-in user/tenant, so they must
  // never survive a logout or a new login.
  extraReducers: (builder) => {
    builder
      .addCase(logoutSuccess, (state) => {
        resetBatchCache(state);
      })
      .addCase(loginSuccess, (state) => {
        resetBatchCache(state);
      });
  },
});

export const {
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
  clearAppointmentError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;