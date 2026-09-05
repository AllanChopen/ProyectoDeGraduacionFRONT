import { useEffect, useState } from 'react';
import { createPublicContactMessage } from '../../../../src/api/contactoApi';
import { getPublicSocialLinks } from '../../../../src/api/redSocialApi';
import { buildSocialLinksMap } from '../../../../src/utils/socialLinks';
import './Contact.css';

function Contact({ slug }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLinks, setSocialLinks] = useState(() => buildSocialLinksMap());

  useEffect(() => {
    let isMounted = true;

    const loadSocialLinks = async () => {
      if (!slug) {
        if (isMounted) {
          setSocialLinks(buildSocialLinksMap());
        }
        return;
      }

      try {
        const data = await getPublicSocialLinks(slug);
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
  }, [slug]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!slug) {
      setMessage('No se pudo identificar la banda para enviar el mensaje.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData(form);
    const payload = {
      nombre: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      mensaje: String(formData.get('message') ?? '').trim(),
    };

    try {
      await createPublicContactMessage(slug, payload);
      setMessage('Gracias, recibimos tu mensaje y responderemos pronto.');
      form.reset();
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar el mensaje. Intentalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
            {socialLinks.email.label ? (
              <li>
                <img src="/icons/mail.svg" alt="mail" />
                {socialLinks.email.label}
              </li>
            ) : null}
          </ul>
        </article>

        <aside className="bp-contact-panel">
          <form className="bp-contact-form" onSubmit={handleSubmit}>
            <div className="bp-field-row bp-field-row-2">
              <input name="name" className="bp-field" type="text" placeholder="Tu nombre" required />
              <input name="email" className="bp-field" type="email" placeholder="Tu correo" required />
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
              <button type="submit" className="bp-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}

export default Contact;
