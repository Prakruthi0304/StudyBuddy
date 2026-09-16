import { create } from "zustand";

type User = { name: string; email: string };

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (u: User, t: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sb_token", token);
      localStorage.setItem("sb_user", JSON.stringify(user));
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sb_token");
      localStorage.removeItem("sb_user");
    }
    set({ user: null, token: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sb_token");
    const userStr = localStorage.getItem("sb_user");
    if (token && userStr) set({ token, user: JSON.parse(userStr) });
  },
}));
