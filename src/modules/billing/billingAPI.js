import axiosClient from "../../services/axiosClient";
import {
  encryptData,
  decryptData
} from "../../services/encryptionService";

export const getBilling = async () => {
  const response = await axiosClient.get("/billing");
  return decryptData(response.data.payload);
};

export const getBillingById = async (billingId) => {
  const response = await axiosClient.get(`/billing/${billingId}`);
  return decryptData(response.data.payload);
};

export const getPaymentSummary = async () => {
  const response = await axiosClient.get("/billing/summary");
  return decryptData(response.data.payload);
};

export const createBilling = async (data) => {
  const encryptedData = encryptData(data);

  const response = await axiosClient.post(
    "/billing",
    { payload: encryptedData }
  );

  return decryptData(response.data.payload);
};

export const updateBilling = async (billingId, data) => {
  const encryptedData = encryptData(data);

  const response = await axiosClient.put(
    `/billing/${billingId}`,
    { payload: encryptedData }
  );

  return decryptData(response.data.payload);
};

export const deleteBilling = async (billingId) => {
  const response = await axiosClient.delete(`/billing/${billingId}`);
  return decryptData(response.data.payload);
};

export const updatePaymentStatus = async (billingId, status) => {
 const encryptedData = encryptData({
  payment_status: status
});

  const response = await axiosClient.patch(
    `/billing/${billingId}/status`,
    { payload: encryptedData }
  );

  return decryptData(response.data.payload);
};

// Invoice form dropdowns (lightweight, not the paginated /patients and /appointments)
export const getBillingPatientOptions = async () => {
  const response = await axiosClient.get("/billing/patient-options");
  return decryptData(response.data.payload);
};

export const getBillingAppointmentOptions = async (patientId) => {
  const response = await axiosClient.get("/billing/appointment-options", {
    params: { patient_id: patientId }
  });
  return decryptData(response.data.payload);
};