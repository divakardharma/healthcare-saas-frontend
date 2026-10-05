import { useCallback } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchCalendarDayRequest,
  fetchCalendarRangeRequest,
  fetchUpcomingRequest,
  fetchTooltipRequest,
  clearSelectedAppointment,
  clearCalendarError,
} from "../calendarSlice";

export default function useCalendar() {
  const dispatch = useDispatch();

  const state = useSelector(
    (store) => store.calendar
  );

  const fetchDay = useCallback(
    (date, providerId) =>
      dispatch(
        fetchCalendarDayRequest({
          date,
          providerId,
        })
      ),
    [dispatch]
  );

  const fetchRange = useCallback(
    (
      startDate,
      endDate,
      providerId
    ) =>
      dispatch(
        fetchCalendarRangeRequest({
          startDate,
          endDate,
          providerId,
        })
      ),
    [dispatch]
  );

  const fetchUpcoming = useCallback(
    (providerId) =>
      dispatch(
        fetchUpcomingRequest(providerId)
      ),
    [dispatch]
  );

  const fetchTooltip = useCallback(
    (appointmentId) =>
      dispatch(
        fetchTooltipRequest(appointmentId)
      ),
    [dispatch]
  );

  const clearSelected = useCallback(
    () =>
      dispatch(
        clearSelectedAppointment()
      ),
    [dispatch]
  );

  const clearError = useCallback(
    () =>
      dispatch(
        clearCalendarError()
      ),
    [dispatch]
  );

  return {
    ...state,
    fetchDay,
    fetchRange,
    fetchUpcoming,
    fetchTooltip,
    clearSelected,
    clearError,
  };
}