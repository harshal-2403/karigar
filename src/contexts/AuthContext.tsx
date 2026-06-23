import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_ENDPOINTS } from "@/config/api";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AppUser | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = "karigar_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppUser;
        if (parsed?.id && parsed?.email) {
          setUserState(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUser = useCallback((next: AppUser | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUserState(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        user?: AppUser;
      };
      if (!res.ok || !data.user) {
        throw new Error(data.message || "Login failed");
      }
      setUser(data.user);
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      setUser,
      isAuthenticated: !!user,
      isLoading,
    }),
    [user, login, logout, setUser, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
