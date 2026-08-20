import { useEffect, useState } from 'react';
import './Newsletter.css';

const POPUP_KEY = 'seen_subscribe_popup_v1';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [message, setMessage] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [unsubscribeMessage, setUnsubscribeMessage] = useState('');
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(POPUP_KEY);
    if (seen) return;

    const timer = setTimeout(() => setShowPopup(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = (event) => {
    event.preventDefault();
    setMessage('Gracias por suscribirte. Recibiras noticias, shows y lanzamientos.');
    setEmail('');
    localStorage.setItem(POPUP_KEY, '1');
    setShowPopup(false);
  };

  const handlePopupSubscribe = (event) => {
    event.preventDefault();
    setPopupMessage('Suscripcion completada. Bienvenido al canal de noticias.');
    localStorage.setItem(POPUP_KEY, '1');
    setTimeout(() => setShowPopup(false), 700);
  };

  const handleUnsubscribe = (event) => {
    event.preventDefault();
    if (!unsubscribeEmail.trim()) {
      setUnsubscribeMessage('Ingresa un correo valido.');
      return;
    }

    setUnsubscribeMessage('Tu correo fue removido del canal de noticias.');
    setUnsubscribeEmail('');
  };

  const closePopup = () => {
    localStorage.setItem(POPUP_KEY, '1');
    setShowPopup(false);
  };

  return (
    <>
      <section id="subscribe" className="bp-section" aria-label="Suscribete al canal de noticias">
        <div className="bp-section-header">
          <h2 className="bp-section-title">Canal de noticias</h2>
          <div className="bp-divider" />
        </div>

        <div className="bp-container bp-newsletter-wrap">
          <aside className="bp-contact-panel bp-newsletter-panel">
            <form className="bp-contact-form" onSubmit={handleSubscribe}>
              <div className="bp-field-row">
                <input
                  name="email"
                  className="bp-field"
                  type="email"
                  placeholder="Tu correo"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="bp-form-actions">
                <div className="bp-form-message">{message}</div>
                <button type="submit" className="bp-btn">
                  Suscribirme
                </button>
              </div>
            </form>

            <p className="bp-newsletter-note">
              Recibiras noticias, shows y lanzamientos via email. Puedes darte de baja en cualquier momento.
              <button type="button" className="bp-inline-link" onClick={() => setShowUnsubscribeModal(true)}>
                Haz click aqui
              </button>
            </p>
          </aside>
        </div>
      </section>

      {showUnsubscribeModal ? (
        <div className="bp-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="false">
          <div className="bp-modal-card">
            <button
              type="button"
              aria-label="Cerrar"
              className="bp-modal-close"
              onClick={() => {
                setShowUnsubscribeModal(false);
                setUnsubscribeMessage('');
              }}
            >
              x
            </button>
            <h3>Darse de baja</h3>
            <p className="bp-about-text">Introduce el correo que quieres desuscribir y pulsa Darme de baja.</p>
            <form onSubmit={handleUnsubscribe}>
              <input
                type="email"
                name="email"
                className="bp-field"
                placeholder="Tu correo"
                required
                value={unsubscribeEmail}
                onChange={(event) => setUnsubscribeEmail(event.target.value)}
              />
              <div className="bp-unsubscribe-actions">
                <button type="submit" className="bp-btn bp-btn-small">
                  Darme de baja
                </button>
                <button type="button" className="bp-btn bp-btn-ghost" onClick={() => setShowUnsubscribeModal(false)}>
                  Cancelar
                </button>
              </div>
              <div className="bp-unsubscribe-message">{unsubscribeMessage}</div>
            </form>
          </div>
        </div>
      ) : null}

      {showPopup ? (
        <div className="bp-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="false">
          <div className="bp-popup-card">
            <button type="button" aria-label="Cerrar" className="bp-modal-close" onClick={closePopup}>
              x
            </button>
            <h3>Unete al canal de noticias</h3>
            <p className="bp-about-text">
              Recibe noticias, shows y lanzamientos exclusivos. Sin spam, puedes darte de baja en cualquier momento.
            </p>
            <form className="bp-popup-form" onSubmit={handlePopupSubscribe}>
              <input type="email" className="bp-field" placeholder="Tu correo" required />
              <button type="submit" className="bp-btn bp-btn-small">
                Suscribirme
              </button>
            </form>
            <div className="bp-unsubscribe-message">{popupMessage}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Newsletter;
