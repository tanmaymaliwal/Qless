import api from "./axios";

export const getCafesApi   = ()       => api.get("/cafes");
export const createCafeApi = (data)   => api.post("/cafes", data);
export const getMenuApi    = (cafeId) => api.get(`/menu/${cafeId}`);