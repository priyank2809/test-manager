import { create } from "zustand";
import { login as loginApi, type LoginPayload, type AuthUser } from "../api/auth";
import { useTestsStore } from "./testsStore";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("auth_token"),
  isAuthenticated: Boolean(localStorage.getItem("auth_token")),
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await loginApi(payload);
      localStorage.setItem("auth_token", token);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Login failed. Please try again.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, isAuthenticated: false });
    useTestsStore.getState().invalidate();
  },
}));