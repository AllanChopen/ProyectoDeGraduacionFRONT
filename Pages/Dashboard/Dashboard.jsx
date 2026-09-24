import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getDashboardAnalytics, getDashboardSummary } from '../../src/api/dashboardApi';
import '../BandPublic/BandPublic.css';
import { formatDate } from './dashboardStorage';
import './Dashboard.css';

const money = (value) => `Q${Number(value ?? 0).toLocaleString('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

function Dashboard() {
  const { slug = '' } = useParams();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [summaryData, analyticsData] = await Promise.all([
          getDashboardSummary(),
          getDashboardAnalytics(),
        ]);
        if (!isMounted) return;
        setSummary(summaryData);
        setAnalytics(analyticsData);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'No se pudo cargar el dashboard.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const managementLinks = useMemo(() => [
    { label: 'Productos', value: summary?.productos ?? 0, to: `/${slug}/dashboard/productos`, cta: 'Gestionar catalogo' },
    { label: 'Shows', value: summary?.shows ?? 0, to: `/${slug}/dashboard/shows`, cta: 'Gestionar eventos' },
    { label: 'Noticias', value: summary?.noticias ?? 0, to: `/${slug}/dashboard/blog`, cta: 'Gestionar blog' },
    { label: 'Mensajes', value: summary?.mensajes ?? 0, to: `/${slug}/dashboard/mensajes`, cta: 'Ver bandeja' },
    { label: 'Ordenes', value: analytics?.ordenes?.nuevas ?? 0, to: `/${slug}/dashboard/ordenes`, cta: 'Gestionar ordenes' },
    { label: 'Pagina publica', value: null, to: `/${slug}/dashboard/banda`, cta: 'Editar informacion' },
  ], [slug, summary, analytics]);

  const monthlyVariation = analytics?.ingresos?.variacionPorcentualVsMesAnterior;
  const variationLabel = monthlyVariation === null || monthlyVariation === undefined
    ? 'Sin base de comparacion'
    : `${Number(monthlyVariation) >= 0 ? '+' : ''}${Number(monthlyVariation).toFixed(1)}% vs mes anterior`;

  const primaryMetrics = [
    { label: 'Ingresos historicos', value: money(analytics?.ingresos?.historico), tone: 'revenue' },
    { label: 'Ingresos este mes', value: money(analytics?.ingresos?.mesActual), tone: 'current', detail: variationLabel },
    { label: 'Ingresos mes anterior', value: money(analytics?.ingresos?.mesAnterior), tone: 'previous', detail: 'Mes calendario anterior' },
    { label: 'Ordenes nuevas', value: analytics?.ordenes?.nuevas ?? 0, tone: 'orders', to: `/${slug}/dashboard/ordenes` },
    { label: 'Ordenes enviadas', value: analytics?.ordenes?.enviadas ?? 0, tone: 'sent' },
    { label: 'Productos vendidos', value: analytics?.merch?.unidadesVendidas ?? 0, tone: 'merch' },
    { label: 'Entradas vendidas', value: analytics?.eventos?.ticketsVendidos ?? 0, tone: 'tickets' },
    { label: 'Merch este mes', value: money(analytics?.ingresos?.merchMesActual), tone: 'merch-income' },
    { label: 'Eventos este mes', value: money(analytics?.ingresos?.eventosMesActual), tone: 'event-income' },
  ];

  if (isLoading) {
    return <main className="bp-page dashboard-page"><NavBar /><LoadingState label="Cargando dashboard..." /><Footer /></main>;
  }

  return (
    <main className="bp-page dashboard-page">
      <NavBar />
      <section className="bp-section dashboard-shell" aria-label="Dashboard overview">
        <header className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">Panel de control</span>
            <h1>{summary?.banda || 'Tu banda'}</h1>
            <p>Ventas, contenido y actividad reciente.</p>
          </div>
          <Link to={`/${slug}`} className="bp-btn bp-btn-small bp-btn-ghost">Ver pagina publica</Link>
        </header>

        {error ? <p className="dashboard-error">{error}</p> : null}

        <div className="dashboard-primary-grid">
          {primaryMetrics.map((metric) => {
            const content = <><span className="dashboard-metric-label">{metric.label}</span><strong>{metric.value}</strong>{metric.detail ? <span className="dashboard-metric-detail">{metric.detail}</span> : null}{metric.to ? <span className="dashboard-metric-link">Revisar ahora →</span> : null}</>;
            return metric.to
              ? <Link key={metric.label} to={metric.to} className={`dashboard-metric dashboard-metric-${metric.tone}`}>{content}</Link>
              : <article key={metric.label} className={`dashboard-metric dashboard-metric-${metric.tone}`}>{content}</article>;
          })}
        </div>

        <div className="dashboard-sales-grid">
          <article className="bp-contact-panel dashboard-sales-card">
            <div className="dashboard-card-heading">
              <div><span className="dashboard-eyebrow">Merch</span><h2>Ventas de productos</h2></div>
              <strong>{money(analytics?.ingresos?.merchMesActual)}</strong>
            </div>
            <div className="dashboard-mini-stats">
              <p><strong>{analytics?.ordenes?.enviadas ?? 0}</strong><span>ordenes enviadas</span></p>
              <p><strong>{analytics?.ordenes?.nuevas ?? 0}</strong><span>por preparar</span></p>
            </div>
            <h3>Productos mas vendidos</h3>
            <div className="dashboard-ranking">
              {(analytics?.merch?.topProductos ?? []).map((product, index) => (
                <div key={`${product.productoId}-${index}`} className="dashboard-ranking-row">
                  <span className="dashboard-rank">{index + 1}</span><strong>{product.nombre}</strong><span>{product.unidadesVendidas} uds.</span>
                </div>
              ))}
              {(analytics?.merch?.topProductos ?? []).length === 0 ? <p className="bp-meta">Aun no hay ventas de productos.</p> : null}
            </div>
          </article>

          <article className="bp-contact-panel dashboard-sales-card">
            <div className="dashboard-card-heading">
              <div><span className="dashboard-eyebrow">Eventos</span><h2>Venta de entradas</h2></div>
              <strong>{money(analytics?.ingresos?.eventosMesActual)}</strong>
            </div>
            <div className="dashboard-mini-stats">
              <p><strong>{analytics?.eventos?.ticketsVendidos ?? 0}</strong><span>entradas vendidas</span></p>
              <p><strong>{analytics?.eventos?.eventosConVentas ?? 0}</strong><span>eventos con ventas</span></p>
            </div>
            <h3>Eventos destacados</h3>
            <div className="dashboard-ranking">
              {(analytics?.eventos?.topEventos ?? []).map((event, index) => (
                <div key={`${event.eventoId}-${index}`} className="dashboard-ranking-row dashboard-event-row">
                  <span className="dashboard-rank">{index + 1}</span>
                  <div><strong>{event.nombre}</strong><small>{event.ubicacion || 'Sin ubicacion'}</small></div>
                  <span>{event.entradasVendidas} entradas · {money(event.ingresos)}</span>
                </div>
              ))}
              {(analytics?.eventos?.topEventos ?? []).length === 0 ? <p className="bp-meta">Aun no hay ventas de entradas.</p> : null}
            </div>
          </article>
        </div>

        <div className="dashboard-lower-grid">
          <section className="bp-contact-panel dashboard-activity-card">
            <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">En vivo</span><h2>Actividad reciente</h2></div></div>
            <div className="dashboard-activity-list">
              {(analytics?.actividadReciente ?? []).map((activity, index) => {
                const isMerch = activity.tipo === 'merch';
                const row = <><span className={`dashboard-activity-dot ${isMerch ? 'is-merch' : 'is-event'}`} /><div><strong>{isMerch ? 'Compra de merch' : activity.eventoNombre || 'Venta de entradas'}</strong><small>{isMerch ? `Estado: ${activity.estado}` : `${activity.cantidadEntradas ?? 0} entradas`} · {formatDate(activity.fecha)}</small></div><strong>{money(activity.monto)}</strong></>;
                return isMerch
                  ? <Link key={`${activity.tipo}-${activity.ordenId}-${index}`} to={`/${slug}/dashboard/ordenes/${activity.ordenId}`} className="dashboard-activity-row">{row}</Link>
                  : <div key={`${activity.tipo}-${activity.ordenId}-${index}`} className="dashboard-activity-row">{row}</div>;
              })}
              {(analytics?.actividadReciente ?? []).length === 0 ? <p className="bp-meta">Aun no hay actividad registrada.</p> : null}
            </div>
          </section>

          <aside className="dashboard-management">
            <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">Accesos rapidos</span><h2>Administracion</h2></div></div>
            <div className="dashboard-management-grid">
              {managementLinks.map((item) => (
                <Link key={item.label} to={item.to} className="dashboard-management-link bp-contact-panel">
                  <span>{item.label}</span>{item.value !== null ? <strong>{item.value}</strong> : <strong>→</strong>}<small>{item.cta}</small>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default Dashboard;
