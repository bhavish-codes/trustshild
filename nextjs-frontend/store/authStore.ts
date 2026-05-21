// store/authStore.ts — Zustand auth store
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem("trustshield_token", token);
        localStorage.setItem("trustshield_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("trustshield_token");
        localStorage.removeItem("trustshield_user");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "trustshield_auth" }
  )
);
