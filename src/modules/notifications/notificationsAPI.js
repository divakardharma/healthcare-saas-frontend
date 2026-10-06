import axiosClient from "../../services/axiosClient";
import { decryptData } from "../../services/encryptionService";

export const getNotifications = async () => {
  const response = await axiosClient.get("/notifications");
  const decryptedData = decryptData(response.data.payload);
  return decryptedData.data;
};