import axiosClient from "../../services/axiosClient";
import {
  encryptData,
  decryptData
} from "../../services/encryptionService";

export const getStaff = async () => {
  const response = await axiosClient.get("/staff");

  return decryptData(response.data.payload);
};

export const updateStaffRole = async (staffId, data) => {
  const encryptedData = encryptData(data);

  const response = await axiosClient.put(
    `/staff/${staffId}`,
    {
      payload: encryptedData
    }
  );

  return decryptData(response.data.payload);
};

export const updateStaffStatus = async (staffId, status) => {
  const encryptedData = encryptData({ status });

  const response = await axiosClient.patch(
    `/staff/${staffId}/status`,
    {
      payload: encryptedData
    }
  );

  return decryptData(response.data.payload);
};