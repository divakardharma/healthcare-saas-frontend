import axiosClient from "../../services/axiosClient";
import { encryptData, decryptData } from "../../services/encryptionService";
import refreshClient from "../../services/refreshClient";

export const getCsrfToken = () => {
  return axiosClient.get("/csrf-token");
};

export const loginAPI = (loginData) => {
  const encryptedPayload = encryptData(loginData);

  return axiosClient.post("/login", {
    payload: encryptedPayload,
  });
};

export const refreshTokenAPI = () => 
  refreshClient.post("/refresh");

export const logoutAPI = () => {
  return axiosClient.post("/logout");
};
export const changePassword = async ({
  current_password,
  new_password,
}) => {
  const response = await axiosClient.post("/change-password", {
    payload: encryptData({
      current_password,
      new_password,
    }),
  });

  return decryptData(response.data.payload);
};