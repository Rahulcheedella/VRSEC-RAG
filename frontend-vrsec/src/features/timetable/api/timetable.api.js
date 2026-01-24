import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";

export const generateTimetable = async (payload) => {
  const res = await http.post(endpoints.generateTimetable, payload);
  return res.data;
};
