import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../dashboardSlice";

export const useDashboard = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state) => state.dashboard
  );

  const loadDashboard = () => {
    dispatch(fetchDashboard());
  };

  return {
    data,
    loading,
    error,
    loadDashboard
  };
};