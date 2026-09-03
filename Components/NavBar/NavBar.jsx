import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import './Navbar.css';

const RESERVED_ROOTS = new Set(['', 'login', 'dashboard', 'carrito', 'carrito-tickets']);

function getBandSlug(pathname) {
  const [firstSegment] = pathname.split('/').filter(Boolean);
  return RESERVED_ROOTS.has(firstSegment || '') ? null : firstSegment;
}

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { merchTotalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const bandSlug = useMemo(() => getBandSlug(location.pathname), [location.pathname]);
  const homePath = bandSlug ? `/${bandSlug}` : '/';

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  const buildSectionHref = (sectionId) => `${homePath}#${sectionId}`;

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <Link to={homePath} className="logo" onClick={closeMenu}>
        <span className="logo-mark" aria-hidden="true">
          <img src="/icons/cart.svg" alt="Brand icon" />
        </span>
        <span className="logo-text">Lost In The Ocean</span>
      </Link>

      <div className="header-actions">
        <Link to="/carrito" aria-label="Carrito de merch" className="header-cart" title="Carrito de merch">
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
          <li>
            <Link to="/dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
          </li>
          <li>
            {isAuthenticated ? (
              <button type="button" className="nav-logout" onClick={handleLogout}>
                Cerrar sesion
              </button>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
            )}
          </li>
        </ul>

        <div className="nav-social">
          <a
            href="https://www.instagram.com/lostintheoceanband"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="ico"
            title="Instagram"
          >
            <img src="/icons/instagram.svg" alt="Instagram" />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="ico"
            title="Facebook"
          >
            <img src="/icons/facebook.svg" alt="Facebook" />
          </a>
          <a
            href="https://www.tiktok.com/@lito.band"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="ico"
            title="TikTok"
          >
            <img src="/icons/tiktok.svg" alt="TikTok" />
          </a>
          <a href="mailto:litobandaoficial@gmail.com" aria-label="Email" className="ico" title="Email">
            <img src="/icons/mail.svg" alt="Email" />
          </a>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;