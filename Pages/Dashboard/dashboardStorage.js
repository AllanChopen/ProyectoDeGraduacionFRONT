export const DASH_NEWSLETTER_SENDS_KEY = 'lito_dashboard_newsletter_sends_v1';
export const CONTACT_MESSAGES_KEY = 'lito_contact_messages_v1';
export const NEWSLETTER_SUBSCRIBERS_KEY = 'lito_newsletter_subscribers_v1';

export function readList(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('es-GT');
}

export function makeId() {
  return Date.now();
}
