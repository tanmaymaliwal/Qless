import api from "./axios";

export const getWalletApi   = ()     => api.get("/users/wallet");
export const addFundsApi    = (data) => api.post("/users/wallet/add", data);
export const getExpensesApi = ()     => api.get("/users/expenses");