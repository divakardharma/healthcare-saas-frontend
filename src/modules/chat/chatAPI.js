import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

const encryptedBody = (data) => ({
  payload: encryptData(data),
});

export const getChatUsersAPI = () =>
  axiosClient.get("/chat/users");

export const getConversationAPI = (userId) =>
  axiosClient.get(`/chat/${userId}`);

export const sendMessageAPI = (data) =>
  axiosClient.post("/chat/send", encryptedBody(data));

export const deleteMessageAPI = (data) =>
  axiosClient.post("/chat/delete", encryptedBody(data));