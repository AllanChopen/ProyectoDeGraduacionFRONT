const DEFAULT_SOCIAL_LINKS = {
  instagram: {
    href: '',
    label: '',
  },
  facebook: {
    href: '',
    label: '',
  },
  tiktok: {
    href: '',
    label: '',
  },
  email: {
    href: '',
    label: '',
  },
};

function normalizeToken(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function resolveSocialType(tipo, nombre) {
  const token = normalizeToken(tipo || nombre);

  if (!token) return null;
  if (token.includes('instagram') || token === 'ig') return 'instagram';
  if (token.includes('facebook') || token === 'fb') return 'facebook';
  if (token.includes('tiktok') || token.includes('ticktock')) return 'tiktok';
  if (token.includes('correo') || token.includes('email') || token.includes('mail')) return 'email';

  return null;
}

function toEmailAddress(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.replace(/^mailto:/i, '').trim();
}

function toEmailHref(value) {
  const email = toEmailAddress(value);
  return email ? `mailto:${email}` : '';
}

function toExternalHref(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `https://${raw}`;
}

export function buildSocialLinksMap(input, fallback = {}) {
  const links = {
    instagram: { ...DEFAULT_SOCIAL_LINKS.instagram, ...(fallback.instagram || {}) },
    facebook: { ...DEFAULT_SOCIAL_LINKS.facebook, ...(fallback.facebook || {}) },
    tiktok: { ...DEFAULT_SOCIAL_LINKS.tiktok, ...(fallback.tiktok || {}) },
    email: { ...DEFAULT_SOCIAL_LINKS.email, ...(fallback.email || {}) },
  };

  if (!Array.isArray(input)) {
    return links;
  }

  for (const entry of input) {
    const type = resolveSocialType(entry?.tipo, entry?.nombre);
    if (!type) {
      continue;
    }

    if (type === 'email') {
      const emailLabel = toEmailAddress(entry?.nombre || entry?.url);
      const emailHref = toEmailHref(entry?.url || entry?.nombre);
      if (emailHref) {
        links.email.href = emailHref;
      }
      if (emailLabel) {
        links.email.label = emailLabel;
      }
      continue;
    }

    const href = toExternalHref(entry?.url);
    if (href) {
      links[type].href = href;
    }

    const label = String(entry?.nombre || '').trim();
    if (label) {
      links[type].label = label;
    }
  }

  return links;
}
