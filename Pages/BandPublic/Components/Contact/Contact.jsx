import { useState } from 'react';
import './Contact.css';

function Contact() {
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('Gracias, recibimos tu mensaje y responderemos pronto.');
    event.currentTarget.reset();
  };

  return (
    <section id="contact" className="bp-section" aria-label="Contact Lost In The Ocean">
      <div className="bp-section-header">
        <h2 className="bp-section-title">Contacto</h2>
        <div className="bp-divider" />
      </div>

      <div className="bp-container bp-contact-grid">
        <article className="bp-contact-copy">
          <h3 className="bp-about-title">Escribenos</h3>
          <p className="bp-about-text">
            Si tienes preguntas, propuestas o quieres contratar a la banda, envianos un mensaje y te
            responderemos pronto. Tambien puedes seguirnos en nuestras redes para novedades y conciertos.
          </p>
          <ul className="bp-contact-list">
            <li>
              <img src="/icons/mail.svg" alt="mail" />
              litobandaoficial@gmail.com
            </li>
            <li>
              <img src="/icons/instagram.svg" alt="instagram" />
              @LOSTINTHEOCEANDBAND
            </li>
          </ul>
        </article>

        <aside className="bp-contact-panel">
          <form className="bp-contact-form" onSubmit={handleSubmit}>
            <div className="bp-field-row bp-field-row-2">
              <input name="name" className="bp-field" type="text" placeholder="Tu nombre" required />
              <input name="email" className="bp-field" type="email" placeholder="Tu correo" required />
            </div>
            <div className="bp-field-row">
              <input name="phone" className="bp-field" type="tel" placeholder="Telefono (opcional)" />
            </div>
            <div className="bp-field-row">
              <textarea
                name="message"
                className="bp-field bp-textarea"
                placeholder="Tu mensaje"
                rows={6}
                required
              />
            </div>
            <div className="bp-form-actions">
              <div className="bp-form-message">{message}</div>
              <button type="submit" className="bp-btn">
                Enviar
              </button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}

export default Contact;
