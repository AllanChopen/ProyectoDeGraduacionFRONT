import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo small">
            <span className="logo-text">Lost In The Ocean</span>
          </div>
          <div className="footer-contact">
            <ul className="social-contact-list">
              <li>
                <a
                  href="https://www.instagram.com/lostintheoceanband"
                  className="ico"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/icons/instagram.svg" alt="Instagram" />
                </a>
                <span className="contact-text">@LOSTINTHEOCEANBAND</span>
              </li>
              <li>
                <a
                  href="https://www.facebook.com"
                  className="ico"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/icons/facebook.svg" alt="Facebook" />
                </a>
                <span className="contact-text">Lost In The Ocean Band</span>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@lito.band"
                  className="ico"
                  aria-label="TikTok"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/icons/tiktok.svg" alt="TikTok" />
                </a>
                <span className="contact-text">@lito.band</span>
              </li>
              <li>
                <a href="mailto:litobandaoficial@gmail.com" className="ico" aria-label="Email">
                  <img src="/icons/mail.svg" alt="Email" />
                </a>
                <span className="contact-text">litobandaoficial@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-logo-right" aria-hidden="true">
          <img src="/icons/cart.svg" alt="Lost In The Ocean logo" />
        </div>
      </div>

      <div className="sub-footer">
        <small>Copyright {year} Lost In The Ocean. All rights reserved.</small>
      </div>
    </footer>
  );
}

export default Footer;