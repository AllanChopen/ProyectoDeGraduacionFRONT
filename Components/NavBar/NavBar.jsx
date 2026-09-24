import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getBandById, getPublicBand } from '../../src/api/bandApi';
import { getPublicSocialLinks } from '../../src/api/redSocialApi';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { buildSocialLinksMap } from '../../src/utils/socialLinks';
import './Navbar.css';

const RESERVED_ROOTS = new Set(['', '404', 'login', 'dashboard', 'carrito', 'carrito-tickets', 'tienda']);

function getBandSlug(pathname) {
  const [firstSegment] = pathname.split('/').filter(Boolean);
  return RESERVED_ROOTS.has(firstSegment || '') ? null : firstSegment;
}

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [managedSlug, setManagedSlug] = useState('');
  const [brandName, setBrandName] = useState('');
  const [socialLinks, setSocialLinks] = useState(() => buildSocialLinksMap());
  const { merchTotalItems } = useCart();
  const { bandaId, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const bandSlug = useMemo(() => getBandSlug(location.pathname), [location.pathname]);
  const homePath = bandSlug
    ? `/${bandSlug}`
    : managedSlug
      ? `/${managedSlug}`
      : '/';
  const dashboardPath = bandSlug
    ? `/${bandSlug}/dashboard`
    : managedSlug
      ? `/${managedSlug}/dashboard`
      : '/login';

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    let isMounted = true;

    const loadManagedSlug = async () => {
      if (!isAuthenticated || !bandaId) {
        if (isMounted) {
          setManagedSlug('');
        }
        return;
      }

      try {
        const band = await getBandById(bandaId);
        if (isMounted) {
          setManagedSlug(band?.slug ?? '');
        }
      } catch {
        if (isMounted) {
          setManagedSlug('');
        }
      }
    };

    loadManagedSlug();

    return () => {
      isMounted = false;
    };
  }, [bandaId, isAuthenticated]);

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

  const buildSectionHref = (sectionId) => `${homePath}#${sectionId}`;

  const handleLogout = () => {
    const principalSlug = bandSlug || managedSlug;
    logout();
    closeMenu();
    navigate(principalSlug ? `/${principalSlug}` : '/', { replace: true });
  };

  return (
    <header className="site-header">
      <Link to={homePath} className="logo" onClick={closeMenu}>
        <span className="logo-mark" aria-hidden="true">
          <img src="/icons/cart.svg" alt="Brand icon" />
        </span>
        {brandName ? <span className="logo-text">{brandName}</span> : null}
      </Link>

      <div className="header-actions">
        <Link to={bandSlug ? `/${bandSlug}/carrito` : '/'} aria-label="Carrito de merch" className="header-cart" title="Carrito de merch">
          <img src="/icons/cart.svg" alt="Cart" className="cart-icon" />
          <span className="cart-count">{merchTotalItems}</span>
        </Link>

        <button
          type="button"
          className={`nav-toggle ${isOpen ? 'active' : ''}`}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`site-nav ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <ul>
          <li>
            <a href={buildSectionHref('hero')} onClick={closeMenu}>
              Home
            </a>
          </li>
          <li>
            <a href={buildSectionHref('about')} onClick={closeMenu}>
              About
            </a>
          </li>
          <li>
            <a href={buildSectionHref('products')} onClick={closeMenu}>
              Merch
            </a>
          </li>
          <li>
            <a href={buildSectionHref('posts')} onClick={closeMenu}>
              Blog
            </a>
          </li>
          <li>
            <a href={buildSectionHref('shows')} onClick={closeMenu}>
              Shows
            </a>
          </li>
          <li>
            <a href={buildSectionHref('contact')} onClick={closeMenu}>
              Contacto
            </a>
          </li>
          {isAuthenticated ? (
            <li>
              <Link to={dashboardPath} onClick={closeMenu}>
                Dashboard
              </Link>
            </li>
          ) : null}
          <li>
            {isAuthenticated ? (
              <button type="button" className="nav-logout" onClick={handleLogout}>
                Cerrar sesion
              </button>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                Iniciar sesion
              </Link>
            )}
          </li>
        </ul>

        <div className="nav-social">
          {socialLinks.instagram.href ? (
            <a
              href={socialLinks.instagram.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="ico"
              title="Instagram"
            >
              <img src="/icons/instagram.svg" alt="Instagram" />
            </a>
          ) : null}
          {socialLinks.facebook.href ? (
            <a
              href={socialLinks.facebook.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="ico"
              title="Facebook"
            >
              <img src="/icons/facebook.svg" alt="Facebook" />
            </a>
          ) : null}
          {socialLinks.tiktok.href ? (
            <a
              href={socialLinks.tiktok.href}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="ico"
              title="TikTok"
            >
              <img src="/icons/tiktok.svg" alt="TikTok" />
            </a>
          ) : null}
          {socialLinks.email.href ? (
            <a href={socialLinks.email.href} aria-label="Email" className="ico" title="Email">
              <img src="/icons/mail.svg" alt="Email" />
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
