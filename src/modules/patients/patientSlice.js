import { createSlice } from "@reduxjs/toolkit";

import { loginSuccess, logoutSuccess } from "../auth/authSlice";

const initialState = {
  // Flattened view of every cached batch (kept for existing consumers such
  // as the appointment patient picker).
  patients: [],

  // Server batches (16 patients each), keyed by batch/page number.
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

  selectedPatient: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const flattenBatches = (batches) =>
  Object.keys(batches)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((page) => batches[page]);

const resetBatchCache = (state) => {
  state.patients = [];
  state.batches = {};
  state.inFlight = {};
  state.batchErrors = {};
  state.blocking = {};
  state.total = 0;
  state.hasMore = false;
  state.loading = false;
  state.cacheVersion += 1;
};

const patientSlice = createSlice({
  name: "patients",

  initialState, 

  reducers: {
    // Ask for one batch. `fetchPatientsRequest()` still means "batch 1".
    // A non-prefetch request for a batch that is not cached is one the
    // user is waiting on, so it drives `loading` / `error`.
    fetchPatientsRequest: {
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
    fetchPatientsStart: (state, action) => {
      const { page } = action.payload;

      state.inFlight[page] = true;
      delete state.batchErrors[page];
    },

    fetchPatientsSuccess: (state, action) => {
      const { page, patients, total, hasMore, version } = action.payload;

      if (version !== state.cacheVersion) {
        return;
      }

      delete state.inFlight[page];
      delete state.batchErrors[page];
      delete state.blocking[page];

      state.batches[page] = patients;
      state.patients = flattenBatches(state.batches);
      state.total = total;

      // hasMore describes the newest batch only.
      const newest = Math.max(...Object.keys(state.batches).map(Number));

      if (page >= newest) {
        state.hasMore = hasMore;
      }

      state.loading = Object.keys(state.blocking).length > 0;
    },

    fetchPatientsFailure: (state, action) => {
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

    // Drop every cached batch (after create/update/delete, logout, login).
    resetPatientBatches: (state) => {
      resetBatchCache(state);
    },

    fetchPatientRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchPatientSuccess: (state, action) => {
      state.loading = false;
      state.selectedPatient = action.payload;
    },

    fetchPatientFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPatientRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    updatePatientRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    deletePatientRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    patientActionSuccess: (state, action) => {
      state.actionLoading = false;

      if (action.payload?.id) {
        const index = state.patients.findIndex(
          (patient) =>
            patient.id === action.payload.id
        );

        if (index >= 0) {
          state.patients[index] = action.payload;
        }

        state.selectedPatient = action.payload;
      }
    },

    patientActionFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    clearPatientError: (state) => {
      state.error = null;
    },

    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },
  },

  // Cached patients belong to one signed-in user/tenant, so they must never
  // survive a logout or a new login.
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
  clearPatientError,
  clearSelectedPatient,
} = patientSlice.actions;

export default patientSlice.reducer;