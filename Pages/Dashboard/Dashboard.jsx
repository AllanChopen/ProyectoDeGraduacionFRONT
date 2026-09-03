import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import NavBar from '../../Components/NavBar/NavBar';
import { getDashboardSummary } from '../../src/api/dashboardApi';
import {
  getManagedPosts,
  getManagedProducts,
  getManagedShows
} from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import {
  CONTACT_MESSAGES_KEY,
  DASH_NEWSLETTER_SENDS_KEY,
  NEWSLETTER_SUBSCRIBERS_KEY,
  formatDate,
  makeId,
  readList,
  writeList
} from './dashboardStorage';
import './Dashboard.css';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [shows, setShows] = useState([]);
  const [posts, setPosts] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [newsletterSends, setNewsletterSends] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterBody, setNewsletterBody] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    setProducts(getManagedProducts());
    setShows(getManagedShows());
    setPosts(getManagedPosts());
    setNewsletterSends(readList(DASH_NEWSLETTER_SENDS_KEY));
    setContactMessages(readList(CONTACT_MESSAGES_KEY));
    setSubscribers(readList(NEWSLETTER_SUBSCRIBERS_KEY));

    const loadSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError('');

      try {
        const summary = await getDashboardSummary();
        if (!isMounted) {
          return;
        }
        setDashboardSummary(summary);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setSummaryError(error.message || 'No se pudo cargar el resumen del dashboard.');
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const overview = useMemo(
    () => [
      {
        label: 'Productos',
        value: dashboardSummary?.productos ?? products.length,
        to: '/dashboard/productos',
        cta: 'Gestionar productos'
      },
      {
        label: 'Shows',
        value: dashboardSummary?.shows ?? shows.length,
        to: '/dashboard/shows',
        cta: 'Gestionar shows'
      },
      {
        label: 'Noticias Blog',
        value: dashboardSummary?.noticias ?? posts.length,
        to: '/dashboard/blog',
        cta: 'Gestionar noticias'
      },
      {
        label: 'Suscriptores Newsletter',
        value: dashboardSummary?.suscriptores ?? subscribers.length,
        to: '/dashboard',
        cta: 'Ver lista'
      },
      {
        label: 'Mensajes de Contacto',
        value: dashboardSummary?.mensajes ?? contactMessages.length,
        to: '/dashboard',
        cta: 'Ver mensajes'
      }
    ],
    [
      dashboardSummary,
      products.length,
      shows.length,
      posts.length,
      subscribers.length,
      contactMessages.length
    ]
  );

  const handleSendNewsletter = (event) => {
    event.preventDefault();
    const entry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      subject: newsletterSubject,
      body: newsletterBody,
      recipients: subscribers.length
    };
    const next = [entry, ...newsletterSends];
    setNewsletterSends(next);
    writeList(DASH_NEWSLETTER_SENDS_KEY, next);
    setNewsletterSubject('');
    setNewsletterBody('');
    setStatusMessage(`Newsletter preparada para ${subscribers.length} suscriptores.`);
  };

  return (
    <main className="bp-page dashboard-page">
      <NavBar />

      <section className="bp-section" aria-label="Dashboard overview">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Dashboard</h1>
          <div className="bp-divider" />
          <p className="dashboard-subtitle">
            {dashboardSummary?.banda
              ? `Panel de control de ${dashboardSummary.banda}: navega a cada modulo para agregar, editar, eliminar y revisar contenido.`
              : 'Panel de control: navega a cada modulo para agregar, editar, eliminar y revisar contenido.'}
          </p>
          {isLoadingSummary ? <p className="bp-meta">Cargando resumen del dashboard...</p> : null}
          {summaryError ? <p className="bp-meta">{summaryError}</p> : null}
        </div>

        <div className="bp-container dashboard-overview-grid">
          {overview.map((item) => (
            <Link key={item.label} to={item.to} className="dashboard-kpi bp-contact-panel">
              <span className="dashboard-kpi-label">{item.label}</span>
              <strong className="dashboard-kpi-value">{item.value}</strong>
              <span className="dashboard-kpi-cta">{item.cta}</span>
            </Link>
          ))}
        </div>

        <div className="bp-container dashboard-lists-grid">
          <article className="bp-contact-panel dashboard-card">
            <h2 className="bp-about-title">Mensajes de Contacto</h2>
            {contactMessages.length === 0 ? (
              <p className="bp-meta">Aun no hay mensajes.</p>
            ) : (
              <ul className="dashboard-list">
                {contactMessages.slice(0, 10).map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.name || 'Sin nombre'}</strong>
                    <span>{entry.email || '-'}</span>
                    <span>{entry.message || '-'}</span>
                    <small>{formatDate(entry.createdAt)}</small>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="bp-contact-panel dashboard-card">
            <h2 className="bp-about-title">Suscriptores Newsletter</h2>
            {subscribers.length === 0 ? (
              <p className="bp-meta">No hay suscriptores por ahora.</p>
            ) : (
              <ul className="dashboard-list">
                {subscribers.slice(0, 12).map((subscriber) => (
                  <li key={subscriber}>
                    <strong>{subscriber}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="bp-contact-panel dashboard-card">
            <h2 className="bp-about-title">Envio Newsletter</h2>
            <form className="dashboard-form" onSubmit={handleSendNewsletter}>
              <input
                className="bp-field"
                placeholder="Asunto"
                value={newsletterSubject}
                onChange={(event) => setNewsletterSubject(event.target.value)}
                required
              />
              <textarea
                className="bp-field dashboard-textarea"
                placeholder="Contenido del correo"
                value={newsletterBody}
                onChange={(event) => setNewsletterBody(event.target.value)}
                required
              />
              <p className="bp-meta">Suscriptores actuales: {subscribers.length}</p>
              <button type="submit" className="bp-btn bp-btn-small">
                Enviar simulacion
              </button>
            </form>

            {newsletterSends.length > 0 ? (
              <ul className="dashboard-list dashboard-inline-list">
                {newsletterSends.slice(0, 3).map((send) => (
                  <li key={send.id}>
                    <strong>{send.subject}</strong>
                    <small>{formatDate(send.createdAt)}</small>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        </div>

        <div className="bp-container dashboard-status-wrap">
          <p className="dashboard-status">{statusMessage}</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Dashboard;
