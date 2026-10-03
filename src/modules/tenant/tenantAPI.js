import axiosClient from "../../services/axiosClient";
import { encryptData } from "../../services/encryptionService";

export const fetchTenantConfig = () => {
  return axiosClient.get("/tenant/config");
};

export const registerTenantAPI = (tenantData) => {
  const encryptedPayload = encryptData(tenantData);

  return axiosClient.post("/tenant/register", {
    payload: encryptedPayload,
  });
};