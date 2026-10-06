import { useDispatch, useSelector } from "react-redux";
import {
  fetchBilling,
  fetchBillingById,
  fetchPaymentSummary,
  createBilling,
  updateBilling,
  deleteBilling,
  updatePaymentStatus
} from "../billingSlice";

const useBilling = () => {
  const dispatch = useDispatch();

  const {
    billing,
    summary,
    selectedBilling,
    loading,
    error
  } = useSelector((state) => state.billing);

  const loadBilling = () => {
    dispatch(fetchBilling());
  };

  const loadBillingById = (billingId) => {
    dispatch(fetchBillingById(billingId));
  };

  const loadPaymentSummary = () => {
    dispatch(fetchPaymentSummary());
  };

  const addBilling = (data) => {
    dispatch(createBilling(data));
  };

  const editBilling = (billingId, data) => {
    dispatch(
      updateBilling({
        billingId,
        data
      })
    );
  };

  const removeBilling = (billingId) => {
    dispatch(deleteBilling(billingId));
  };

  const changePaymentStatus = (billingId, status) => {
    dispatch(
      updatePaymentStatus({
        billingId,
        status
      })
    );
  };

  return {
    billing,
    summary,
    selectedBilling,
    loading,
    error,
    loadBilling,
    loadBillingById,
    loadPaymentSummary,
    addBilling,
    editBilling,
    removeBilling,
    changePaymentStatus
  };
};

export default useBilling;