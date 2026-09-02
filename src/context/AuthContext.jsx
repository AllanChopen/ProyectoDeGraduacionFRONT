import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/authApi';
import { decodeJwt } from '../utils/jwt';

const TOKEN_STORAGE_KEY = 'lito_auth_token';
const USER_STORAGE_KEY = 'lito_auth_user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(readStoredUser);

  const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);

  const role = claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null;
  const bandaId = claims?.BandaId ?? null;

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    role,
    bandaId,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
