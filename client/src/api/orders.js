import api from "./axios";

export const placeOrderApi  = (data) => api.post("/orders", data);
export const getMyOrdersApi = ()     => api.get("/orders/my");
export const scanOrderApi   = (data) => api.post("/orders/scan", data);