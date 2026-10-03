import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: "appointments",

  initialState,

  reducers: {
    fetchAppointmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchAppointmentsSuccess: (state, action) => {
      state.loading = false;
      state.appointments = action.payload;
    },

    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
});

export const {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
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