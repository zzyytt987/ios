import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Appearance } from "react-native";
import api, { saveToken, getToken, removeToken } from "../api/client";

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  dark: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleDark: () => void;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isLoading: true,
  dark: false,
  login: async () => {},
  logout: async () => {},
  toggleDark: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dark, setDark] = useState(Appearance.getColorScheme() === "dark");

  useEffect(() => {
    getToken().then((t) => {
      if (t) setIsLoggedIn(true);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post("/api/auth/login", { username, password });
    await saveToken(res.data.access_token);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setIsLoggedIn(false);
  }, []);

  const toggleDark = useCallback(() => setDark((d) => !d), []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, dark, login, logout, toggleDark }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
