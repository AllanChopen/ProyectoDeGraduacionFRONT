import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getMyContactMessages } from '../../src/api/contactoApi';
import '../BandPublic/BandPublic.css';
import { formatDate } from './dashboardStorage';
import './ManageContent.css';

function DashboardMessageDetail() {
  const { slug = '', messageId = '' } = useParams();
  const [entry, setEntry] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMessage = async () => {
      setIsLoading(true);
      setStatus('');

      try {
        const data = await getMyContactMessages();
        if (!isMounted) {
          return;
        }

        const list = Array.isArray(data) ? data : [];
        const found = list.find((item) => String(item?.id) === String(messageId));

        if (!found) {
          setEntry(null);
          setStatus('No se encontro el mensaje solicitado.');
          return;
        }

        setEntry(found);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setEntry(null);
        setStatus(error.message || 'No se pudo cargar el detalle del mensaje.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessage();

    return () => {
      isMounted = false;
    };
  }, [messageId]);

  const bodyParagraphs = useMemo(() => {
    if (!entry?.mensaje) {
      return [];
    }
    return String(entry.mensaje).split(/\r?\n\r?\n/).filter(Boolean);
  }, [entry]);

  if (isLoading) {
    return (
      <main className="bp-page manage-page">
        <NavBar />
        <LoadingState label="Cargando mensaje..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Detalle de mensaje de contacto">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Detalle de Mensaje</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">Lectura completa del mensaje recibido.</p>
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard`} className="bp-btn bp-btn-small bp-btn-ghost">
              Volver al dashboard
            </Link>
          </div>
        </div>

        <div className="bp-container">
          {status ? <p className="manage-status">{status}</p> : null}

          {entry ? (
            <article className="bp-contact-panel dashboard-card">
              <h2 className="bp-about-title">{entry.nombre || 'Sin nombre'}</h2>
              <p className="bp-meta">Email: {entry.email || '-'}</p>
              <p className="bp-meta">Recibido: {formatDate(entry.createdAt)}</p>
              <div className="manage-list">
                {bodyParagraphs.length > 0 ? (
                  bodyParagraphs.map((paragraph) => (
                    <p key={paragraph} className="bp-about-text">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="bp-about-text">{entry.mensaje || '-'}</p>
                )}
              </div>
              <div className="manage-actions manage-message-back-action">
                <Link to={`/${slug}/dashboard/mensajes`} className="bp-btn bp-btn-small bp-btn-ghost">
                  Volver a mensajes
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default DashboardMessageDetail;