import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setToken: (token) => set({ token }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "qless-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);