import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPublicBand } from '../../src/api/bandApi';
import { getPublicSocialLinks } from '../../src/api/redSocialApi';
import { buildSocialLinksMap } from '../../src/utils/socialLinks';
import './Footer.css';

const RESERVED_ROOTS = new Set(['', 'login', 'dashboard', 'carrito', 'carrito-tickets']);

function getBandSlug(pathname) {
  const [firstSegment] = pathname.split('/').filter(Boolean);
  return RESERVED_ROOTS.has(firstSegment || '') ? null : firstSegment;
}

function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const [brandName, setBrandName] = useState('');
  const [socialLinks, setSocialLinks] = useState(() => buildSocialLinksMap());
  const bandSlug = useMemo(() => getBandSlug(location.pathname), [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const loadBrandName = async () => {
      if (!bandSlug) {
        if (isMounted) {
          setBrandName('');
        }
        return;
      }

      try {
        const band = await getPublicBand(bandSlug);
        if (isMounted) {
          setBrandName(band?.nombre || '');
        }
      } catch {
        if (isMounted) {
          setBrandName('');
        }
      }
    };

    loadBrandName();

    return () => {
      isMounted = false;
    };
  }, [bandSlug]);

  useEffect(() => {
    let isMounted = true;

    const loadSocialLinks = async () => {
      if (!bandSlug) {
        if (isMounted) {
          setSocialLinks(buildSocialLinksMap());
        }
        return;
      }

      try {
        const data = await getPublicSocialLinks(bandSlug);
        if (isMounted) {
          setSocialLinks(buildSocialLinksMap(data));
        }
      } catch {
        if (isMounted) {
          setSocialLinks(buildSocialLinksMap());
        }
      }
    };

    loadSocialLinks();

    return () => {
      isMounted = false;
    };
  }, [bandSlug]);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo small">
            {brandName ? <span className="logo-text">{brandName}</span> : null}
          </div>
          <div className="footer-contact">
            <ul className="social-contact-list">
              {socialLinks.instagram.href ? (
                <li>
                  <a
                    href={socialLinks.instagram.href}
                    className="ico"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/icons/instagram.svg" alt="Instagram" />
                  </a>
                  <span className="contact-text">{socialLinks.instagram.label || socialLinks.instagram.href}</span>
                </li>
              ) : null}
              {socialLinks.facebook.href ? (
                <li>
                  <a
                    href={socialLinks.facebook.href}
                    className="ico"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/icons/facebook.svg" alt="Facebook" />
                  </a>
                  <span className="contact-text">{socialLinks.facebook.label || socialLinks.facebook.href}</span>
                </li>
              ) : null}
              {socialLinks.tiktok.href ? (
                <li>
                  <a
                    href={socialLinks.tiktok.href}
                    className="ico"
                    aria-label="TikTok"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/icons/tiktok.svg" alt="TikTok" />
                  </a>
                  <span className="contact-text">{socialLinks.tiktok.label || socialLinks.tiktok.href}</span>
                </li>
              ) : null}
              {socialLinks.email.href ? (
                <li>
                  <a href={socialLinks.email.href} className="ico" aria-label="Email">
                    <img src="/icons/mail.svg" alt="Email" />
                  </a>
                  <span className="contact-text">{socialLinks.email.label || socialLinks.email.href.replace(/^mailto:/i, '')}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="footer-logo-right" aria-hidden="true">
          <img src="/icons/cart.svg" alt={brandName ? `${brandName} logo` : 'Logo de banda'} />
        </div>
      </div>

      <div className="sub-footer">
        {brandName ? <small>Copyright {year} {brandName}. All rights reserved.</small> : null}
      </div>
    </footer>
  );
}

export default Footer;