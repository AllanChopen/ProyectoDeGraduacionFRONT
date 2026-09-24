import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getPublicBand, updateMyBandShippingPrice } from '../../src/api/bandApi';
import { getMyOrders } from '../../src/api/ordenesApi';
import '../BandPublic/BandPublic.css';
import { formatDate } from './dashboardStorage';
import './ManageContent.css';
import './DashboardOrders.css';

const money = (value) => `Q${Number(value ?? 0).toFixed(2)}`;

function DashboardOrders() {
  const { slug = '' } = useParams();
  const [orders, setOrders] = useState([]);
  const [shippingPrice, setShippingPrice] = useState('');
  const [status, setStatus] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setStatus('');
      try {
        const [ordersData, bandData] = await Promise.all([
          getMyOrders(),
          getPublicBand(slug),
        ]);
        if (!isMounted) return;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setShippingPrice(String(Number(bandData?.precioEnvio ?? 0)));
      } catch (error) {
        if (!isMounted) return;
        setStatus(error.message || 'No se pudieron cargar las ordenes.');
        setOrders([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => {
      const sentA = String(a?.estado).toLowerCase() === 'enviada' ? 1 : 0;
      const sentB = String(b?.estado).toLowerCase() === 'enviada' ? 1 : 0;
      if (sentA !== sentB) return sentA - sentB;
      return (new Date(a?.createdAt).getTime() || 0) - (new Date(b?.createdAt).getTime() || 0);
    }),
    [orders]
  );

  const handleShippingSubmit = async (event) => {
    event.preventDefault();
    const parsedPrice = Number(shippingPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setShippingStatus('Ingresa un precio de envio valido.');
      return;
    }

    setIsSavingShipping(true);
    setShippingStatus('');
    try {
      await updateMyBandShippingPrice(parsedPrice);
      setShippingPrice(String(parsedPrice));
      setShippingStatus('Precio de envio actualizado.');
    } catch (error) {
      setShippingStatus(error.message || 'No se pudo actualizar el precio de envio.');
    } finally {
      setIsSavingShipping(false);
    }
  };

  if (isLoading) {
    return <main className="bp-page manage-page"><NavBar /><LoadingState label="Cargando ordenes..." /><Footer /></main>;
  }

  return (
    <main className="bp-page manage-page">
      <NavBar />
      <section className="bp-section" aria-label="Gestion de ordenes">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Ordenes</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">Revisa las compras y administra su envio.</p>
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard`} className="bp-btn bp-btn-small bp-btn-ghost">Volver al dashboard</Link>
          </div>
        </div>

        <div className="bp-container manage-layout">
          <aside className="bp-contact-panel orders-shipping-panel">
            <h2 className="bp-about-title">Precio de envio</h2>
            <p className="bp-meta">Este monto se aplicara a las nuevas compras de productos.</p>
            <form className="manage-form" onSubmit={handleShippingSubmit}>
              <label className="bp-meta" htmlFor="shipping-price">Monto en quetzales</label>
              <input
                id="shipping-price"
                className="bp-field"
                type="number"
                min="0"
                step="0.01"
                value={shippingPrice}
                onChange={(event) => setShippingPrice(event.target.value)}
                required
              />
              <button className="bp-btn bp-btn-small" type="submit" disabled={isSavingShipping}>
                {isSavingShipping ? 'Guardando...' : 'Guardar precio'}
              </button>
            </form>
            {shippingStatus ? <p className="manage-status">{shippingStatus}</p> : null}
          </aside>

          <section className="bp-contact-panel">
            <h2 className="bp-about-title">Listado de ordenes</h2>
            {status ? <p className="manage-status">{status}</p> : null}
            {!status && sortedOrders.length === 0 ? <p className="bp-meta">Aun no hay ordenes.</p> : null}
            <div className="manage-list orders-list">
              {sortedOrders.map((order) => {
                const isSent = String(order.estado).toLowerCase() === 'enviada';
                const units = (order.productos ?? []).reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0);
                return (
                  <Link key={order.id} to={`/${slug}/dashboard/ordenes/${order.id}`} className="manage-item order-card">
                    <div className="manage-item-copy">
                      <div className="order-card-heading">
                        <strong>Comprador: {order.compradorNombre || 'Sin nombre'}</strong>
                        <span className={`order-status ${isSent ? 'is-sent' : 'is-new'}`}>{isSent ? 'Enviada' : 'Nueva'}</span>
                      </div>
                      <p className="bp-meta">{units} {units === 1 ? 'producto' : 'productos'} · {money(order.total)}</p>
                      <small className="bp-meta">{formatDate(order.createdAt)}</small>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default DashboardOrders;
