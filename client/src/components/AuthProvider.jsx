import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api("/auth/me").then(({ user: current }) => setUser(current)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const login = useCallback(async (email, password) => { const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); setUser(data.user); return data.user; }, []);
  const register = useCallback(async (input) => { const data = await api("/auth/register", { method: "POST", body: JSON.stringify(input) }); setUser(data.user); return data.user; }, []);
  const logout = useCallback(async () => { await api("/auth/logout", { method: "POST" }); setUser(null); }, []);
  const value = useMemo(() => ({ user, loading, login, register, logout, refresh: async () => { const data = await api("/auth/me"); setUser(data.user); return data.user; } }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
