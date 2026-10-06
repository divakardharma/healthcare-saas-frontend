import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  loading: false,
  error: null
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    fetchNotifications: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchNotifications,
  fetchNotificationsSuccess,
  fetchNotificationsFailure
} = notificationsSlice.actions;

export default notificationsSlice.reducer;