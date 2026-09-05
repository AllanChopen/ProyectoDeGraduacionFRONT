const AUTH_SESSIONS_STORAGE_KEY = 'lito_auth_sessions_v1';
const ACTIVE_AUTH_SLUG_STORAGE_KEY = 'lito_auth_active_slug_v1';

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function readAuthSessions() {
  return readJsonStorage(AUTH_SESSIONS_STORAGE_KEY, {});
}

export function writeAuthSessions(sessions) {
  const hasSessions = sessions && Object.keys(sessions).length > 0;
  if (!hasSessions) {
    localStorage.removeItem(AUTH_SESSIONS_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export function readActiveAuthSlug() {
  return localStorage.getItem(ACTIVE_AUTH_SLUG_STORAGE_KEY) || '';
}

export function writeActiveAuthSlug(slug) {
  if (!slug) {
    localStorage.removeItem(ACTIVE_AUTH_SLUG_STORAGE_KEY);
    return;
  }

  localStorage.setItem(ACTIVE_AUTH_SLUG_STORAGE_KEY, slug);
}

export function getSessionForSlug(slug) {
  if (!slug) {
    return null;
  }

  const sessions = readAuthSessions();
  return sessions[slug] ?? null;
}

export function storeSessionForSlug(slug, session) {
  if (!slug || !session?.token) {
    return readAuthSessions();
  }

  const sessions = readAuthSessions();
  const nextSessions = {
    ...sessions,
    [slug]: {
      token: session.token,
      user: session.user ?? null,
    },
  };

  writeAuthSessions(nextSessions);
  return nextSessions;
}

export function removeSessionForSlug(slug) {
  if (!slug) {
    return readAuthSessions();
  }

  const sessions = readAuthSessions();
  if (!sessions[slug]) {
    return sessions;
  }

  const nextSessions = { ...sessions };
  delete nextSessions[slug];
  writeAuthSessions(nextSessions);
  return nextSessions;
}

export function getTokenForActiveSlug() {
  const activeSlug = readActiveAuthSlug();
  if (activeSlug) {
    const session = getSessionForSlug(activeSlug);
    if (session?.token) {
      return session.token;
    }
  }

  const legacyToken = localStorage.getItem('lito_auth_token');
  return legacyToken || '';
}
