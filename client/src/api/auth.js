import api from "./axios";

export const loginApi          = (data) => api.post("/auth/login", data);
export const registerApi       = (data) => api.post("/auth/register", data);
export const registerAdminApi  = (data) => api.post("/auth/register-admin", data);
export const logoutApi         = ()     => api.post("/auth/logout");
export const getMeApi          = ()     => api.get("/auth/me");
export const changePasswordApi = (data) => api.put("/auth/password", data);