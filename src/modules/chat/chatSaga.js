import { call, put, takeLatest } from "redux-saga/effects";

import {
  getChatUsersAPI,
  getConversationAPI,
  sendMessageAPI,
  deleteMessageAPI,
} from "./chatAPI";

import {
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
  deleteMessageRequest,
  deleteMessageSuccess,
  deleteMessageFailure,
} from "./chatSlice";

import { decryptData } from "../../services/encryptionService";

const decryptResponse = (response) =>
  decryptData(response.data.payload);

const getErrorMessage = (error, fallback) => {
  try {
    const payload = error.response?.data?.payload;
    if (payload) {
      return decryptData(payload)?.message || fallback;
    }
  } catch (_) {}

  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
};

function* fetchUsers() {
  try {
    const result = decryptResponse(yield call(getChatUsersAPI));
    yield put(
      fetchChatUsersSuccess(
        Array.isArray(result.data) ? result.data : []
      )
    );
  } catch (error) {
    yield put(
      fetchChatUsersFailure(
        getErrorMessage(error, "Failed to load users")
      )
    );
  }
}

function* fetchConversation(action) {
  try {
    const userId = action.payload;
    const result = decryptResponse(
      yield call(getConversationAPI, userId)
    );
    yield put(
      fetchConversationSuccess(
        Array.isArray(result.data) ? result.data : []
      )
    );
  } catch (error) {
    yield put(
      fetchConversationFailure(
        getErrorMessage(error, "Failed to load conversation")
      )
    );
  }
}

function* sendMessage(action) {
  try {
    const { receiver_user_id, message } = action.payload;

    yield call(sendMessageAPI, {
      receiver_user_id,
      message,
    });

    yield put(sendMessageSuccess());
    yield put(fetchConversationRequest(receiver_user_id));
  } catch (error) {
    yield put(
      sendMessageFailure(
        getErrorMessage(error, "Failed to send message")
      )
    );
  }
}

function* deleteMessage(action) {
  try {
    const { messageId, deleteType, receiverUserId } = action.payload;

    yield call(deleteMessageAPI, {
      message_id: messageId,
      delete_type: deleteType,
    });

    yield put(
      deleteMessageSuccess({
        messageId,
        deleteType,
      })
    );

    // Refresh conversation after delete
    if (receiverUserId) {
      yield put(fetchConversationRequest(receiverUserId));
    }
  } catch (error) {
    yield put(
      deleteMessageFailure(
        getErrorMessage(error, "Failed to delete message")
      )
    );
  }
}

function* onSelectUser(action) {
  const userId = action.payload;
  if (userId) {
    yield put(fetchConversationRequest(userId));
  }
}

export default function* chatSaga() {
  yield takeLatest(fetchChatUsersRequest.type, fetchUsers);
  yield takeLatest(fetchConversationRequest.type, fetchConversation);
  yield takeLatest(sendMessageRequest.type, sendMessage);
  yield takeLatest(deleteMessageRequest.type, deleteMessage);
  yield takeLatest(selectChatUser.type, onSelectUser);
}