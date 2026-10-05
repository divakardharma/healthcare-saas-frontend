import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  detailLoading: false,
  detailError: null,
  error: null,
};

const calendarSlice = createSlice({
  name: "calendar",

  initialState,

  reducers: {
    fetchCalendarDayRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchCalendarRangeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchUpcomingRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchCalendarSuccess: (state, action) => {
      state.loading = false;
      state.appointments = action.payload;
    },

    fetchCalendarFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Details use their own loading flag so opening one
    // appointment does not blank out the whole list.
    fetchTooltipRequest: (state) => {
      state.detailLoading = true;
      state.detailError = null;
      state.selectedAppointment = null;
    },

    fetchTooltipSuccess: (state, action) => {
      state.detailLoading = false;
      state.selectedAppointment =
        action.payload;
    },

    fetchTooltipFailure: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload;
    },

    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
      state.detailLoading = false;
      state.detailError = null;
    },

    clearCalendarError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchCalendarDayRequest,
  fetchCalendarRangeRequest,
  fetchUpcomingRequest,
  fetchCalendarSuccess,
  fetchCalendarFailure,
  fetchTooltipRequest,
  fetchTooltipSuccess,
  fetchTooltipFailure,
  clearSelectedAppointment,
  clearCalendarError,
} = calendarSlice.actions;

export default calendarSlice.reducer;