import { apiClient } from './apiClient';

export const signup = (body) => apiClient('/api/auth/signup', { method: 'POST', body, skipAuth: true });
export const personalizeBand = (body) => apiClient('/api/bandas/mi-banda', { method: 'PUT', body });
export const connectPayments = (body) => apiClient('/api/recurrente/connected-account', { method: 'POST', body });
export const getBanks = (token, options = {}) => apiClient('/api/recurrente/banks', {
  ...options,
  headers: { Authorization: `Bearer ${token}` },
});
export const subscriptionCheckout = () => apiClient('/api/recurrente/subscription/checkout', { method: 'POST' });
export const subscriptionStatus = (token, options = {}) => apiClient('/api/recurrente/subscription/status', {
  ...options,
  ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
});

// Store progress only: passwords, bank details and documents stay in memory.
export function readOnboarding(slug) {
  try { return JSON.parse(localStorage.getItem(`backstage_onboarding_${slug}`)) || {}; }
  catch { return {}; }
}

export function saveOnboarding(slug, data) {
  if (!slug) return;
  localStorage.setItem(`backstage_onboarding_${slug}`, JSON.stringify({ ...readOnboarding(slug), ...data }));
}
