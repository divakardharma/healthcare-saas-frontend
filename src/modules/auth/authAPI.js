import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";
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