import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaff,
  updateStaffRole,
  updateStaffStatus
} from "../staffSlice";

const useStaff = () => {
  const dispatch = useDispatch();

  const { staff, loading, error } = useSelector(
    (state) => state.staff
  );

  const loadStaff = () => {
    dispatch(fetchStaff());
  };

  const changeStaffRole = (staffId, userId, roleId, status) => {
    dispatch(
      updateStaffRole({
        staffId,
        userId,
        roleId,
        status
      })
    );
  };

  const changeStaffStatus = (staffId, status) => {
    dispatch(
      updateStaffStatus({
        staffId,
        status
      })
    );
  };

  return {
    staff,
    loading,
    error,
    loadStaff,
    changeStaffRole,
    changeStaffStatus
  };
};

export default useStaff;