import api from "./axios";

export const getWalletApi    = ()     => api.get("/users/wallet", { headers: { "Cache-Control": "no-cache" } });
export const addFundsApi     = (data) => api.post("/users/wallet/add", data);
export const getExpensesApi  = ()     => api.get("/users/expenses", { headers: { "Cache-Control": "no-cache" } });
export const createOrderApi  = (data) => api.post("/payment/create-order", data);
export const verifyPaymentApi = (data) => api.post("/payment/verify", data);