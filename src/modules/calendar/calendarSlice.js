import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
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

    fetchTooltipRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchTooltipSuccess: (state, action) => {
      state.loading = false;
      state.selectedAppointment =
        action.payload;
    },

    fetchTooltipFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
  clearCalendarError,
} = calendarSlice.actions;

export default calendarSlice.reducer;