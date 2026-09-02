import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import './Navbar.css';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { merchTotalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <a href="/#hero" className="logo" onClick={closeMenu}>
        <span className="logo-mark" aria-hidden="true">
          <img src="/icons/cart.svg" alt="Brand icon" />
        </span>
        <span className="logo-text">Lost In The Ocean</span>
      </a>

      <nav className={`site-nav ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <ul>
          <li>
            <a href="/#hero" onClick={closeMenu}>
              Home
            </a>
          </li>
          <li>
            <a href="/#about" onClick={closeMenu}>
              About
            </a>
          </li>
          <li>
            <a href="/#products" onClick={closeMenu}>
              Merch
            </a>
          </li>
          <li>
            <a href="/#posts" onClick={closeMenu}>
              Blog
            </a>
          </li>
          <li>
            <a href="/#shows" onClick={closeMenu}>
              Shows
            </a>
          </li>
          <li>
            <a href="/#contact" onClick={closeMenu}>
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
    </header>
  );
}

export default NavBar;