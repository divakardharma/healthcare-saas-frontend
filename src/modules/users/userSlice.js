import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  actionLoading: false,
};

const userSlice = createSlice({
  name: "users",

  initialState,

  reducers: {
    fetchUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },

    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchUserSuccess: (state, action) => {
      state.loading = false;
      state.selectedUser = action.payload;
    },

    fetchUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createUserRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    updateUserRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    assignRoleRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    removeRoleRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    deleteUserRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },

    userActionSuccess: (state, action) => {
      state.actionLoading = false;

      if (action.payload?.id) {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );

        if (index >= 0) {
          state.users[index] = action.payload;
        }

        state.selectedUser = action.payload;
      }
    },

    userActionFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    clearUserError: (state) => {
      state.error = null;
    },

    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFailure,
  createUserRequest,
  updateUserRequest,
  assignRoleRequest,
  removeRoleRequest,
  deleteUserRequest,
  userActionSuccess,
  userActionFailure,
  clearUserError,
  clearSelectedUser,
} = userSlice.actions;

export default userSlice.reducer;