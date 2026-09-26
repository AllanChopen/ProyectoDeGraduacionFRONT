import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getDashboardAnalytics, getDashboardSummary } from '../../src/api/dashboardApi';
import '../BandPublic/BandPublic.css';
import { RevenueComparison, RevenueSources } from './DashboardCharts';
import { formatDate } from './dashboardStorage';
import './Dashboard.css';

const money = (value) => `Q${Number(value ?? 0).toLocaleString('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;
const count = (value) => Number(value ?? 0).toLocaleString('es-GT');

function DashboardIcon({ name, className = '' }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    products: <><path d="m8 3-5 3 3 5 2-1v11h8V10l2 1 3-5-5-3c0 4-8 4-8 0Z" /></>,
    shows: <><path d="M9 18V5l11-2v13M9 9l11-2" /><ellipse cx="6" cy="18" rx="3" ry="3" /><ellipse cx="17" cy="16" rx="3" ry="3" /></>,
    news: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h8M8 11h8M8 15h4" /></>,
    messages: <path d="M21 4H3v14h5l4 3 4-3h5V4ZM3 5l9 7 9-7" />,
    orders: <><path d="m3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v11M7 5l10 4" /></>,
    band: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M8 9v11" /></>,
    revenue: <><path d="M3 18 9 12l4 3 8-10M15 5h6v6" /></>,
    ticket: <><path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5ZM15 5v3m0 3v2m0 3v3" /></>,
    refresh: <><path d="M20 7a9 9 0 0 0-15-1L2 9m0-6v6h6M4 17a9 9 0 0 0 15 1l3-3m0 6v-6h-6" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    external: <><path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" /></>,
  };
  return <svg className={`dashboard-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function EmptyState({ icon, title, children }) {
  return <div className="dashboard-empty"><DashboardIcon name={icon} /><strong>{title}</strong><p>{children}</p></div>;
}

function Dashboard() {
  const { slug = '' } = useParams();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      setSummary(null);
      setAnalytics(null);
      setUpdatedAt(null);
      try {
        const [summaryData, analyticsData] = await Promise.all([getDashboardSummary(), getDashboardAnalytics()]);
        if (!isMounted) return;
        setSummary(summaryData);
        setAnalytics(analyticsData);
        setUpdatedAt(new Date());
      } catch (loadError) {
        if (isMounted) setError(loadError.message || 'No se pudo cargar el dashboard.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => { isMounted = false; };
  }, [slug, refreshKey]);

  const dashboardPath = `/${slug}/dashboard`;
  const managementLinks = [
    { label: 'Productos', value: summary?.productos, path: 'productos', icon: 'products' },
    { label: 'Shows', value: summary?.shows, path: 'shows', icon: 'shows' },
    { label: 'Noticias', value: summary?.noticias, path: 'blog', icon: 'news' },
    { label: 'Mensajes', value: summary?.mensajes, path: 'mensajes', icon: 'messages' },
    { label: 'Órdenes', value: analytics?.ordenes?.nuevas, path: 'ordenes', icon: 'orders' },
    { label: 'Página de la banda', path: 'banda', icon: 'band' },
  ];
  const monthlyVariation = analytics?.ingresos?.variacionPorcentualVsMesAnterior;
  const hasVariation = monthlyVariation !== null && monthlyVariation !== undefined && Number.isFinite(Number(monthlyVariation));
  const variation = Number(monthlyVariation);
  const variationTone = !hasVariation || variation === 0 ? 'neutral' : variation > 0 ? 'positive' : 'negative';
  const topProducts = analytics?.merch?.topProductos ?? [];
  const topEvents = analytics?.eventos?.topEventos ?? [];
  const maxProductUnits = Math.max(1, ...topProducts.map((product) => Number(product.unidadesVendidas) || 0));
  const maxEventTickets = Math.max(1, ...topEvents.map((event) => Number(event.entradasVendidas) || 0));
  const activities = (analytics?.actividadReciente ?? []).filter((activity) => activityFilter === 'all' || activity.tipo === activityFilter);
  const newOrders = analytics?.ordenes?.nuevas ?? 0;
  const monthLabel = (updatedAt ?? new Date()).toLocaleDateString('es-GT', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <main className="bp-page dashboard-page">
      <NavBar />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Administración de la banda">
          <div className="dashboard-sidebar-brand">
            <span className="dashboard-monogram" aria-hidden="true">{(summary?.banda || slug || 'B').slice(0, 1).toUpperCase()}</span>
            <div><span className="dashboard-eyebrow">Backstage</span><strong>{summary?.banda || 'Tu banda'}</strong></div>
          </div>
          <nav className="dashboard-nav" aria-label="Panel de control">
            <Link to={dashboardPath} className="dashboard-nav-link is-active" aria-current="page"><DashboardIcon name="overview" /><span>Vista general</span><span className="dashboard-nav-active" aria-hidden="true" /></Link>
            <span className="dashboard-nav-label">Administrar</span>
            {managementLinks.map((item) => (
              <Link key={item.path} to={`${dashboardPath}/${item.path}`} className="dashboard-nav-link">
                <DashboardIcon name={item.icon} /><span>{item.label}</span>
                {item.value !== undefined && item.value !== null ? <small>{count(item.value)}</small> : null}
              </Link>
            ))}
          </nav>
          <div className="dashboard-sidebar-note"><span aria-hidden="true">✳</span><p>Tu música en el escenario.<br /><strong>Tu banda, bajo control.</strong></p></div>
          <Link to={`/${slug}`} className="dashboard-public-link">Ver página pública<DashboardIcon name="external" /></Link>
        </aside>

        <section className="dashboard-shell" aria-label="Analíticos de la banda">
          <div className="dashboard-topline"><span>Panel de control <span aria-hidden="true">/</span> Analíticos</span><span className="dashboard-period"><span aria-hidden="true" />{monthLabel}</span></div>
          <header className="dashboard-hero">
            <div><span className="dashboard-eyebrow">El pulso de tu banda</span><h1>Vista <em>general.</em></h1><p>Lo que pasa con tu música, más allá del escenario.</p></div>
            <button type="button" className="dashboard-button dashboard-refresh" onClick={() => setRefreshKey((key) => key + 1)} disabled={isLoading}><DashboardIcon name="refresh" />{isLoading ? 'Actualizando' : 'Actualizar'}</button>
          </header>

          {isLoading ? <div className="dashboard-loading" role="status"><LoadingState label="Preparando los números de tu banda..." /></div> : error ? (
            <div className="dashboard-error" role="alert"><DashboardIcon name="overview" /><h2>No pudimos cargar tus analíticos</h2><p>{error}</p><button type="button" className="dashboard-button" onClick={() => setRefreshKey((key) => key + 1)}>Volver a intentar<DashboardIcon name="arrow" /></button></div>
          ) : (
            <>
              <div className="dashboard-section-label"><h2>En un vistazo</h2><span>Ingresos en quetzales · Q</span></div>
              <div className="dashboard-primary-grid">
                <article className="dashboard-metric dashboard-metric-featured">
                  <div className="dashboard-metric-top"><span>Ingresos del mes</span><DashboardIcon name="revenue" /></div>
                  <strong className="dashboard-metric-value">{money(analytics?.ingresos?.mesActual)}</strong>
                  <div className={`dashboard-metric-detail is-${variationTone}`}>
                    {hasVariation ? <><span className="dashboard-variation">{variation > 0 ? '↗ +' : variation < 0 ? '↘ ' : ''}{variation.toFixed(1)}%</span><span>vs. mes anterior</span></> : <span>Sin base de comparación anterior</span>}
                  </div>
                </article>
                <article className="dashboard-metric">
                  <div className="dashboard-metric-top"><span>Ingresos históricos</span><DashboardIcon name="revenue" /></div>
                  <strong className="dashboard-metric-value">{money(analytics?.ingresos?.historico)}</strong>
                  <span className="dashboard-metric-detail">Merch + entradas · acumulado</span>
                </article>
                <article className="dashboard-metric">
                  <div className="dashboard-metric-top"><span>Productos vendidos</span><DashboardIcon name="products" /></div>
                  <strong className="dashboard-metric-value">{count(analytics?.merch?.unidadesVendidas)}</strong>
                  <span className="dashboard-metric-detail">Unidades · acumulado</span>
                </article>
                <article className="dashboard-metric">
                  <div className="dashboard-metric-top"><span>Entradas vendidas</span><DashboardIcon name="ticket" /></div>
                  <strong className="dashboard-metric-value">{count(analytics?.eventos?.ticketsVendidos)}</strong>
                  <span className="dashboard-metric-detail">{count(analytics?.eventos?.eventosConVentas)} eventos con ventas · acumulado</span>
                </article>
              </div>

              <div className="dashboard-charts-grid">
                <article className="dashboard-panel dashboard-revenue-panel">
                  <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">Rendimiento</span><h2>Ingresos, mes a mes</h2></div><span className="dashboard-tag">Comparativa</span></div>
                  <RevenueComparison current={analytics?.ingresos?.mesActual ?? 0} previous={analytics?.ingresos?.mesAnterior ?? 0} />
                  <p className="dashboard-panel-footnote">Mes actual en curso frente al mes anterior completo · UTC</p>
                </article>
                <article className="dashboard-panel dashboard-sources-panel">
                  <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">Distribución</span><h2>De dónde viene</h2></div><span className="dashboard-tag">Este mes</span></div>
                  <RevenueSources merch={analytics?.ingresos?.merchMesActual ?? 0} events={analytics?.ingresos?.eventosMesActual ?? 0} />
                </article>
              </div>

              <div className="dashboard-section-label dashboard-performance-label"><h2>Los favoritos de tu público</h2><span>Ranking histórico</span></div>
              <div className="dashboard-sales-grid">
                <article className="dashboard-panel">
                  <div className="dashboard-card-heading"><div className="dashboard-heading-with-icon"><DashboardIcon name="products" /><h2>Merch más vendido</h2></div><Link to={`${dashboardPath}/productos`} className="dashboard-text-link">Catálogo<DashboardIcon name="arrow" /></Link></div>
                  {topProducts.length ? <ol className="dashboard-ranking">{topProducts.map((product, index) => (
                    <li key={`${product.productoId}-${index}`} className="dashboard-ranking-row"><span className="dashboard-rank">{String(index + 1).padStart(2, '0')}</span><div className="dashboard-ranking-body"><div className="dashboard-ranking-title"><strong>{product.nombre}</strong><span>{count(product.unidadesVendidas)} <small>uds.</small></span></div><div className="dashboard-rank-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Number(product.unidadesVendidas) || 0) / maxProductUnits * 100}%` }} /></div></div></li>
                  ))}</ol> : <EmptyState icon="products" title="Tus próximos favoritos van aquí">Los productos más vendidos aparecerán con tu primera venta.</EmptyState>}
                </article>
                <article className="dashboard-panel">
                  <div className="dashboard-card-heading"><div className="dashboard-heading-with-icon"><DashboardIcon name="shows" /><h2>Shows destacados</h2></div><Link to={`${dashboardPath}/shows`} className="dashboard-text-link">Shows<DashboardIcon name="arrow" /></Link></div>
                  {topEvents.length ? <ol className="dashboard-ranking">{topEvents.map((event, index) => (
                    <li key={`${event.eventoId}-${index}`} className="dashboard-ranking-row dashboard-event-row"><span className="dashboard-rank">{String(index + 1).padStart(2, '0')}</span><div className="dashboard-ranking-body"><div className="dashboard-ranking-title"><strong>{event.nombre}</strong><span>{count(event.entradasVendidas)} <small>entradas</small></span></div><div className="dashboard-ranking-meta"><span>{event.ubicacion || 'Sin ubicación'}</span><span>{money(event.ingresos)}</span></div><div className="dashboard-rank-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Number(event.entradasVendidas) || 0) / maxEventTickets * 100}%` }} /></div></div></li>
                  ))}</ol> : <EmptyState icon="shows" title="El próximo lleno empieza aquí">Cuando vendas entradas, verás tus shows destacados.</EmptyState>}
                </article>
              </div>

              <div className="dashboard-lower-grid">
                <section className="dashboard-panel dashboard-activity-card" aria-labelledby="dashboard-activity-title">
                  <div className="dashboard-card-heading"><div><span className="dashboard-eyebrow">Últimos movimientos</span><h2 id="dashboard-activity-title">Actividad reciente</h2></div><div className="dashboard-filters" role="group" aria-label="Filtrar actividad">{[{ value: 'all', label: 'Todo' }, { value: 'merch', label: 'Merch' }, { value: 'evento', label: 'Entradas' }].map((filter) => <button key={filter.value} type="button" aria-pressed={activityFilter === filter.value} onClick={() => setActivityFilter(filter.value)}>{filter.label}</button>)}</div></div>
                  <div className="dashboard-activity-list" aria-live="polite">
                    {activities.map((activity, index) => {
                      const isMerch = activity.tipo === 'merch';
                      const row = <><span className={`dashboard-activity-icon ${isMerch ? 'is-merch' : 'is-event'}`}><DashboardIcon name={isMerch ? 'orders' : 'ticket'} /></span><div className="dashboard-activity-info"><strong>{isMerch ? 'Compra de merch' : activity.eventoNombre || 'Venta de entradas'}</strong><small>{formatDate(activity.fecha)}</small></div><span className="dashboard-activity-status">{isMerch ? activity.estado || 'Merch' : `${count(activity.cantidadEntradas)} entradas`}</span><strong className="dashboard-activity-amount">{money(activity.monto)}{isMerch ? <span aria-hidden="true">↗</span> : null}</strong></>;
                      return isMerch ? <Link key={`${activity.tipo}-${activity.ordenId}-${index}`} to={`${dashboardPath}/ordenes/${activity.ordenId}`} className="dashboard-activity-row">{row}</Link> : <div key={`${activity.tipo}-${activity.ordenId}-${index}`} className="dashboard-activity-row">{row}</div>;
                    })}
                    {!activities.length ? <EmptyState icon={activityFilter === 'evento' ? 'ticket' : 'orders'} title="Sin movimientos todavía">{activityFilter === 'all' ? 'Tus próximas ventas tendrán un lugar aquí.' : 'No hay movimientos de este tipo entre las últimas ventas.'}</EmptyState> : null}
                  </div>
                  <p className="dashboard-panel-footnote">Últimas ventas registradas · Importes totales de compra</p>
                </section>
                <aside className="dashboard-operations" aria-labelledby="dashboard-orders-title">
                  <div className="dashboard-card-heading"><span className="dashboard-eyebrow">Detrás del escenario</span><DashboardIcon name="orders" /></div>
                  <h2 id="dashboard-orders-title">Cada pedido,<br /><em>un fan esperando.</em></h2>
                  <div className="dashboard-order-total"><strong>{count(newOrders)}</strong><span>{Number(newOrders) === 1 ? 'orden nueva\npor preparar' : 'órdenes nuevas\npor preparar'}</span></div>
                  <Link to={`${dashboardPath}/ordenes`} className="dashboard-button">Gestionar órdenes<DashboardIcon name="arrow" /></Link>
                  <div className="dashboard-orders-sent"><span>Órdenes enviadas</span><strong>{count(analytics?.ordenes?.enviadas)}</strong></div>
                </aside>
              </div>
              <div className="dashboard-bottomline"><span>Tu banda, en perspectiva.</span><span>{updatedAt ? `Actualizado a las ${updatedAt.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}` : ''}</span></div>
            </>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}

export default Dashboard;
