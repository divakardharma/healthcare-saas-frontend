import axiosClient from "../../services/axiosClient";

const query = (params) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        search.set(key, value);
      }
    }
  );

  const suffix = search.toString();

  return suffix ? `?${suffix}` : "";
};

export const getCalendarDayAPI = (
  date,
  providerId
) =>
  axiosClient.get(
    `/calendar/day${query({
      date,
      provider_id: providerId,
    })}`
  );

export const getCalendarRangeAPI = (
  startDate,
  endDate,
  providerId
) =>
  axiosClient.get(
    `/calendar/range${query({
      start_date: startDate,
      end_date: endDate,
      provider_id: providerId,
    })}`
  );

export const getUpcomingAPI = (
  providerId
) =>
  axiosClient.get(
    `/calendar/upcoming${query({
      provider_id: providerId,
    })}`
  );

export const getCalendarTooltipAPI = (
  appointmentId
) =>
  axiosClient.get(
    `/calendar/appointments/${appointmentId}/tooltip`
  );