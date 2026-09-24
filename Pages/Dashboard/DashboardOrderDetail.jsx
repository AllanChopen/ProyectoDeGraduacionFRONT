import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import { getMyOrderById, markMyOrderAsSent } from '../../src/api/ordenesApi';
import '../BandPublic/BandPublic.css';
import { formatDate } from './dashboardStorage';
import './ManageContent.css';
import './DashboardOrders.css';

const money = (value) => `Q${Number(value ?? 0).toFixed(2)}`;

function DashboardOrderDetail() {
  const { slug = '', orderId = '' } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadOrder = async () => {
      setIsLoading(true);
      setStatus('');
      try {
        const data = await getMyOrderById(orderId);
        if (isMounted) setOrder(data);
      } catch (error) {
        if (!isMounted) return;
        setOrder(null);
        setStatus(error.message || 'No se pudo cargar la orden.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleMarkAsSent = async () => {
    if (!order || String(order.estado).toLowerCase() === 'enviada') return;
    setIsSending(true);
    setStatus('');
    try {
      const response = await markMyOrderAsSent(order.id);
      setOrder((current) => ({ ...current, estado: response?.estado ?? 'enviada', updatedAt: new Date().toISOString() }));
      setStatus(response?.message || 'Orden marcada como enviada.');
    } catch (error) {
      setStatus(error.message || 'No se pudo marcar la orden como enviada.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <main className="bp-page manage-page"><NavBar /><LoadingState label="Cargando orden..." /><Footer /></main>;
  }

  const isSent = String(order?.estado).toLowerCase() === 'enviada';

  return (
    <main className="bp-page manage-page">
      <NavBar />
      <section className="bp-section" aria-label="Detalle de orden">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Orden</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">Informacion completa de la compra y su envio.</p>
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard/ordenes`} className="bp-btn bp-btn-small bp-btn-ghost">Volver a ordenes</Link>
          </div>
        </div>

        <div className="bp-container order-detail-layout">
          {status ? <p className="manage-status order-detail-status">{status}</p> : null}
          {order ? (
            <>
              <article className="bp-contact-panel order-detail-card">
                <div className="order-card-heading">
                  <h2 className="bp-about-title">Comprador</h2>
                  <span className={`order-status ${isSent ? 'is-sent' : 'is-new'}`}>{isSent ? 'Enviada' : 'Nueva'}</span>
                </div>
                <p><strong>Nombre:</strong> {order.compradorNombre || '-'}</p>
                <p><strong>Email:</strong> {order.compradorEmail || '-'}</p>
                <p><strong>Telefono:</strong> {order.compradorTelefono || '-'}</p>
                <p><strong>Direccion:</strong> {order.direccionEnvio || '-'}</p>
                <p className="bp-meta">Creada: {formatDate(order.createdAt)}</p>
                {isSent ? <p className="bp-meta">Actualizada: {formatDate(order.updatedAt)}</p> : null}
                {!isSent ? (
                  <button type="button" className="bp-btn bp-btn-small" onClick={handleMarkAsSent} disabled={isSending}>
                    {isSending ? 'Marcando...' : 'Marcar como enviada'}
                  </button>
                ) : null}
              </article>

              <article className="bp-contact-panel order-detail-card">
                <h2 className="bp-about-title">Resumen</h2>
                <p>Subtotal: {money(order.subtotal)}</p>
                <p>Tarifa de servicio: {money(order.tarifaServicio)}</p>
                <p>Envio: {money(order.costoEnvio)}</p>
                <strong>Total: {money(order.total)}</strong>
                <p className="bp-meta">Estado del pago: {order.estadoPago || '-'}</p>
              </article>

              <section className="order-detail-products">
                <h2 className="bp-about-title">Productos</h2>
                <div className="manage-list">
                  {(order.productos ?? []).map((item, index) => (
                    <article className="manage-item order-product-card" key={item.uuid ?? index}>
                      {item.imagenUrl ? <img className="manage-item-image" src={item.imagenUrl} alt={item.productoNombre || 'Producto'} /> : <div className="manage-item-image" />}
                      <div className="manage-item-copy">
                        <strong>{item.productoNombre || 'Producto'}</strong>
                        {item.variacionNombre ? <p className="bp-meta">Talla: {item.variacionNombre}</p> : null}
                        <p className="bp-meta">Cantidad: {item.cantidad}</p>
                        <p className="bp-meta">Precio unitario: {money(item.precioUnitario)}</p>
                        <strong>Subtotal: {money(item.subtotal)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default DashboardOrderDetail;
