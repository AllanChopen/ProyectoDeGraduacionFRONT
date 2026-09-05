import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getBandById } from '../api/bandApi';
import { login as loginRequest } from '../api/authApi';
import { decodeJwt } from '../utils/jwt';
import {
  getSessionForSlug,
  readActiveAuthSlug,
  readAuthSessions,
  storeSessionForSlug,
  writeActiveAuthSlug,
  writeAuthSessions,
} from '../utils/authSessionStorage';

const LEGACY_TOKEN_STORAGE_KEY = 'lito_auth_token';
const LEGACY_USER_STORAGE_KEY = 'lito_auth_user';

const AuthContext = createContext(null);

function readStoredUser(slug) {
  try {
    if (slug) {
      const session = getSessionForSlug(slug);
      return session?.user ?? null;
    }

    const raw = localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sessions, setSessions] = useState(() => readAuthSessions());
  const [activeSlug, setActiveSlug] = useState(() => readActiveAuthSlug());
  const [isHydrated, setIsHydrated] = useState(false);

  const activeSession = activeSlug ? sessions[activeSlug] ?? null : null;
  const token = activeSession?.token ?? null;
  const user = activeSession?.user ?? readStoredUser();

  const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);

  const role = claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null;
  const bandaId = claims?.BandaId ?? null;

  useEffect(() => {
    if (!isHydrated) {
      writeAuthSessions(sessions);
      writeActiveAuthSlug(activeSlug);
      setIsHydrated(true);
      return;
    }

    writeAuthSessions(sessions);
    writeActiveAuthSlug(activeSlug);
  }, [activeSlug, isHydrated, sessions]);

  useEffect(() => {
    let isMounted = true;

    const migrateLegacySession = async () => {
      if (Object.keys(sessions).length > 0) {
        return;
      }

      const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
      if (!legacyToken) {
        return;
      }

      const legacyClaims = decodeJwt(legacyToken);
      const legacyBandId = legacyClaims?.BandaId ?? null;
      if (!legacyBandId) {
        return;
      }

      try {
        const band = await getBandById(legacyBandId);
        if (!isMounted || !band?.slug) {
          return;
        }

        const migratedSessions = storeSessionForSlug(band.slug, {
          token: legacyToken,
          user: readStoredUser(),
        });
        setSessions(migratedSessions);
        setActiveSlug((current) => current || band.slug);
      } catch {
        // Legacy token is left untouched as a fallback for older storage.
      }
    };

    migrateLegacySession();

    return () => {
      isMounted = false;
    };
  }, [sessions]);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    const claimsData = decodeJwt(data?.token);
    const managedBandId = claimsData?.BandaId ?? null;

    if (!managedBandId) {
      throw new Error('No se pudo identificar la banda de la sesion.');
    }

    const band = await getBandById(managedBandId);
    if (!band?.slug) {
      throw new Error('No se pudo identificar la banda de la sesion.');
    }

    const nextSession = {
      token: data.token,
      user: data.user ?? null,
    };

    setSessions((current) => {
      const next = storeSessionForSlug(band.slug, nextSession);
      return next;
    });
    setActiveSlug(band.slug);
    return { ...data, band };
  };

  const logout = () => {
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    setSessions({});
    setActiveSlug('');
    writeAuthSessions({});
    writeActiveAuthSlug('');
  };

  const hasSessionForSlug = (slug) => Boolean(slug && sessions[slug]?.token);

  const activateSession = (slug) => {
    if (!slug || !sessions[slug]?.token) {
      return false;
    }

    setActiveSlug(slug);
    return true;
  };

  const value = {
    token,
    user,
    role,
    bandaId,
    activeSlug,
    isAuthenticated: Boolean(token),
    hasSessionForSlug,
    activateSession,
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
