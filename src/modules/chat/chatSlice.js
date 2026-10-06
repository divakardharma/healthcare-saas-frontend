import { createSlice } from "@reduxjs/toolkit";
import { logoutSuccess } from "../auth/authSlice";

const initialState = {
  users: [],
  messages: [],
  selectedUserId: null,
  selectedUser: null,
  loadingUsers: false,
  loadingMessages: false,
  sending: false,
  deleting: false,
  error: null,
  sendError: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    fetchChatUsersRequest(state) {
      state.loadingUsers = true;
      state.error = null;
    },
    fetchChatUsersSuccess(state, action) {
      state.loadingUsers = false;
      state.users = Array.isArray(action.payload) ? action.payload : [];
    },
    fetchChatUsersFailure(state, action) {
      state.loadingUsers = false;
      state.error = action.payload || "Failed to load users";
    },

    selectChatUser(state, action) {
      const userId = action.payload;
      state.selectedUserId = userId;
      state.selectedUser =
        state.users.find((u) => u.id === userId) || null;
      state.messages = [];
      state.sendError = null;
    },

    fetchConversationRequest(state) {
      state.loadingMessages = true;
      state.error = null;
    },
    fetchConversationSuccess(state, action) {
      state.loadingMessages = false;
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    fetchConversationFailure(state, action) {
      state.loadingMessages = false;
      state.error = action.payload || "Failed to load conversation";
    },

    sendMessageRequest(state) {
      state.sending = true;
      state.sendError = null;
    },
    sendMessageSuccess(state) {
      state.sending = false;
    },
    sendMessageFailure(state, action) {
      state.sending = false;
      state.sendError = action.payload || "Failed to send message";
    },

    appendMessage(state, action) {
      state.messages.push(action.payload);
    },

    // Delete
    deleteMessageRequest(state) {
      state.deleting = true;
      state.error = null;
    },
    deleteMessageSuccess(state, action) {
      state.deleting = false;
      const { messageId, deleteType } = action.payload;

      if (deleteType === "everyone") {
        state.messages = state.messages.map((m) =>
          m.id === messageId
            ? { ...m, message: "This message was deleted", is_deleted: true }
            : m
        );
      } else {
        // Delete for me → remove from list
        state.messages = state.messages.filter((m) => m.id !== messageId);
      }
    },
    deleteMessageFailure(state, action) {
      state.deleting = false;
      state.error = action.payload || "Failed to delete message";
    },

    clearChatError(state) {
      state.error = null;
      state.sendError = null;
    },

    resetChat() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutSuccess, () => ({ ...initialState }));
  },
});

export const {
  fetchChatUsersRequest,
  fetchChatUsersSuccess,
  fetchChatUsersFailure,
  selectChatUser,
  fetchConversationRequest,
  fetchConversationSuccess,
  fetchConversationFailure,
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFailure,
  appendMessage,
  deleteMessageRequest,
  deleteMessageSuccess,
  deleteMessageFailure,
  clearChatError,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;