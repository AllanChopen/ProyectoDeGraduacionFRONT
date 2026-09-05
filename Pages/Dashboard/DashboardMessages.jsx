import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getMyContactMessages } from '../../src/api/contactoApi';
import '../BandPublic/BandPublic.css';
import { formatDate } from './dashboardStorage';
import './ManageContent.css';

function DashboardMessages() {
  const { slug = '' } = useParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      setIsLoading(true);
      setStatus('');

      try {
        const data = await getMyContactMessages();
        if (!isMounted) {
          return;
        }
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStatus(error.message || 'No se pudieron cargar los mensajes de contacto.');
        setItems([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const dateA = new Date(a?.createdAt).getTime() || 0;
        const dateB = new Date(b?.createdAt).getTime() || 0;
        return dateB - dateA;
      }),
    [items]
  );

  if (isLoading) {
    return (
      <main className="bp-page manage-page">
        <NavBar />
        <LoadingState label="Cargando mensajes..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Mensajes de contacto">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Mensajes de Contacto</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Bandeja de mensajes recibidos desde el formulario publico.
          </p>
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard`} className="bp-btn bp-btn-small bp-btn-ghost">
              Volver al dashboard
            </Link>
          </div>
        </div>

        <div className="bp-container">
          {status ? <p className="manage-status">{status}</p> : null}
          {!isLoading && !status && sortedItems.length === 0 ? (
            <p className="bp-meta">Aun no hay mensajes.</p>
          ) : null}

          <div className="manage-list">
            {sortedItems.map((entry) => (
              <Link
                key={entry.id}
                to={`/${slug}/dashboard/mensajes/${entry.id}`}
                className="manage-item manage-message-item"
              >
                <div className="manage-item-copy">
                  <strong>{entry.nombre || 'Sin nombre'}</strong>
                  <p className="bp-meta">{entry.email || '-'}</p>
                  <p className="bp-meta">{(entry.mensaje || '').slice(0, 140) || '-'}</p>
                  <small className="bp-meta">{formatDate(entry.createdAt)}</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default DashboardMessages;