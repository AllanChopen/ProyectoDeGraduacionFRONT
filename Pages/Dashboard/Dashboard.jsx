import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getMyContactMessages } from '../../src/api/contactoApi';
import { getDashboardSummary } from '../../src/api/dashboardApi';
import '../BandPublic/BandPublic.css';
import './Dashboard.css';

function Dashboard() {
  const { slug = '' } = useParams();
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [contactMessagesCount, setContactMessagesCount] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    let isMounted = true;

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

    const loadContactMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await getMyContactMessages();
        if (!isMounted) {
          return;
        }
        setContactMessagesCount(Array.isArray(data) ? data.length : 0);
      } catch {
        if (!isMounted) {
          return;
        }
        setContactMessagesCount(null);
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadSummary();
    loadContactMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  const isLoading = isLoadingSummary || isLoadingMessages;

  const overview = useMemo(
    () => [
      {
        label: 'Productos',
        value: dashboardSummary?.productos,
        to: `/${slug}/dashboard/productos`,
        cta: 'Gestionar productos'
      },
      {
        label: 'Shows',
        value: dashboardSummary?.shows,
        to: `/${slug}/dashboard/shows`,
        cta: 'Gestionar shows'
      },
      {
        label: 'Noticias Blog',
        value: dashboardSummary?.noticias,
        to: `/${slug}/dashboard/blog`,
        cta: 'Gestionar noticias'
      },
      {
        label: 'Mensajes de Contacto',
        value: dashboardSummary?.mensajes ?? contactMessagesCount,
        to: `/${slug}/dashboard/mensajes`,
        cta: 'Ver bandeja'
      },
      {
        label: 'Informacion General',
        value: null,
        to: `/${slug}/dashboard/banda`,
        cta: 'Configurar pagina publica'
      }
    ],
    [slug, dashboardSummary, contactMessagesCount]
  );

  if (isLoading) {
    return (
      <main className="bp-page dashboard-page">
        <NavBar />
        <LoadingState label="Cargando dashboard..." />
        <Footer />
      </main>
    );
  }

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
          {summaryError ? <p className="bp-meta">{summaryError}</p> : null}
        </div>

        <div className="bp-container dashboard-overview-grid">
          {overview.map((item) => (
            <Link key={item.label} to={item.to} className="dashboard-kpi bp-contact-panel">
              <span className="dashboard-kpi-label">{item.label}</span>
              {item.value !== null && item.value !== undefined ? (
                <strong className="dashboard-kpi-value">{item.value}</strong>
              ) : null}
              <span className="dashboard-kpi-cta">{item.cta}</span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Dashboard;
