import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchChatUsersRequest,
  selectChatUser,
  fetchConversationRequest,
  sendMessageRequest,
  deleteMessageRequest,
  clearChatError,
} from "../chatSlice";

export default function useChat() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.chat);

  const fetchUsers = useCallback(() => {
    dispatch(fetchChatUsersRequest());
  }, [dispatch]);

  const selectUser = useCallback(
    (userId) => {
      dispatch(selectChatUser(userId));
    },
    [dispatch]
  );

  const fetchConversation = useCallback(
    (userId) => {
      dispatch(fetchConversationRequest(userId));
    },
    [dispatch]
  );

  const sendMessage = useCallback(
    (receiverUserId, message) => {
      dispatch(
        sendMessageRequest({
          receiver_user_id: receiverUserId,
          message,
        })
      );
    },
    [dispatch]
  );

  const deleteMessage = useCallback(
    (messageId, deleteType, receiverUserId) => {
      dispatch(
        deleteMessageRequest({
          messageId,
          deleteType, // "me" or "everyone"
          receiverUserId,
        })
      );
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearChatError());
  }, [dispatch]);

  return {
    ...state,
    fetchUsers,
    selectUser,
    fetchConversation,
    sendMessage,
    deleteMessage,
    clearError,
  };
}