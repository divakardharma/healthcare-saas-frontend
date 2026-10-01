import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

reducers: {
  loginRequest: (state) => {
    state.loading = true;
    state.error = null;
  },

  loginSuccess: (state, action) => {
    state.loading = false;
    state.user = action.payload.user;
    state.accessToken = action.payload.accessToken;
    state.isAuthenticated = true;
  },

  loginFailure: (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.isAuthenticated = false;
  },

  refreshRequest: (state) => {
    state.loading = true;
  },

  refreshSuccess: (state, action) => {
    state.loading = false;
    state.accessToken = action.payload.accessToken;
    state.isAuthenticated = true;
    state.error = null;
  },

  refreshFailure: (state) => {
    state.loading = false;
    state.user = null;
    state.accessToken = null;
    state.isAuthenticated = false;
  },

 logoutRequest: (state) => {
  state.loading = true;
  state.error = null;
},

logoutSuccess: (state) => {
  state.user = null;
  state.accessToken = null;
  state.isAuthenticated = false;
  state.loading = false;
  state.error = null;
},

logoutFailure: (state, action) => {
  state.loading = false;
  state.error = action.payload;
},
},
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshRequest,
  refreshSuccess,
  refreshFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
} = authSlice.actions;

export default authSlice.reducer;