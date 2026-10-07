import axiosClient from "../../services/axiosClient";
import { decryptData } from "../../services/encryptionService";

export const getMedicines = async () => {
  const response = await axiosClient.get("/medicines");
  const decryptedData = decryptData(response.data.payload);
  return decryptedData.data;
};