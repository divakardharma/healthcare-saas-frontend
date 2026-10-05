import axiosClient from "../../services/axiosClient";
import { decryptData } from "../../services/encryptionService";

export const getDashboard = async () => {
  const response = await axiosClient.get("/dashboard");

  return decryptData(response.data.payload);
};