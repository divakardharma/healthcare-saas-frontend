import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../notificationsSlice";

const useNotifications = () => {
  const dispatch = useDispatch();

  const { notifications, loading, error } = useSelector(
    (state) => state.notifications
  );

  const loadNotifications = () => {
    dispatch(fetchNotifications());
  };

  return {
    notifications,
    loading,
    error,
    loadNotifications
  };
};

export default useNotifications;