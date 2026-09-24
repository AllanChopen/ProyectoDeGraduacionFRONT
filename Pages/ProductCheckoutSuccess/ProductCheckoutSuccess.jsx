import PurchaseProgress from '../../Components/BandExperience/PurchaseProgress';
import '../../Components/BandExperience/BandExperience.css';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { apiClient } from '../../src/api/apiClient';
import { useCart } from '../../src/context/CartContext';
import '../BandPublic/BandPublic.css';
import './ProductCheckoutSuccess.css';

function ProductCheckoutSuccess() {
  const { slug } = useParams();
  const location = useLocation();
  const { clearMerchCart } = useCart();
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('productCheckout');
    console.log('PRODUCT CHECKOUT RECOVERED:', stored);
    const query = new URLSearchParams(location.search);
    const queryCheckoutId = query.get('checkoutId') || query.get('checkout_id');
    if (!stored && !queryCheckoutId) { setError('No se encontró información del checkout.'); setLoading(false); return undefined; }
    let checkoutId = queryCheckoutId;
    try { checkoutId = checkoutId || JSON.parse(stored)?.checkoutId; } catch { setError('La información del checkout no es válida.'); setLoading(false); return undefined; }
    if (!checkoutId) { setError('No se encontró el identificador del checkout.'); setLoading(false); return undefined; }
    let attempts = 0;
    let intervalId = null;
    let cancelled = false;
    const consultar = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const response = await apiClient(`/api/Ordenes/checkout/${checkoutId}`);
        if (cancelled) return;
        if (response?.estadoPago === 'pagado') {
          cancelled = true;
          setCompra(response);
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
          clearMerchCart();
          localStorage.removeItem('productCheckout');
          return;
        }
        if (response?.estadoPago === 'expirado' || attempts >= 30) {
          cancelled = true;
          if (intervalId) clearInterval(intervalId);
          setError(response?.estadoPago === 'expirado' ? 'El checkout expiró antes de completar el pago.' : 'El pago está tardando más de lo esperado en confirmarse.');
          setLoading(false);
        }
      } catch (requestError) {
        console.error('Error consultando orden:', requestError);
        if (attempts >= 30) {
          cancelled = true;
          if (intervalId) clearInterval(intervalId);
          setError('No se pudo confirmar el estado de la compra.');
          setLoading(false);
        }
      }
    };
    consultar();
    intervalId = setInterval(consultar, 2000);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [location.search]);

  if (loading) return <main className="bp-page bp-experience"><NavBar /><LoadingState label="Confirmando tu pago..." /><Footer /></main>;
  if (error) return <main className="bp-page bp-experience"><NavBar /><section className="bp-section"><div className="bp-contact-panel"><h1>No pudimos confirmar tu compra</h1><p>{error}</p><Link className="bp-btn" to={`/${slug}/store`}>Volver a la tienda</Link></div></section><Footer /></main>;

  const orden = compra.orden;
  return (
    <main className="bp-page bp-experience product-success-page">
      <NavBar />
      <section className="bp-section">
        <header className="experience-success-header">
          <span className="experience-success-mark" aria-hidden="true">✓</span>
          <span className="experience-eyebrow">Merch / Compra confirmada</span>
          <h1>YA ES <em>TUYO.</em></h1>
          <p>Tu pago fue confirmado. Aquí tienes el detalle de tu compra.</p>
        </header>
        <PurchaseProgress confirmed />
        <div className="experience-receipt">
          <div className="experience-receipt-main">
            <section className="bp-contact-panel experience-buyer">
              <span className="experience-eyebrow">Datos de la compra</span>
              <h2>Gracias, {orden.compradorNombre}</h2>
              <p><strong>Email:</strong> {orden.compradorEmail}</p>
              {orden.direccionEnvio ? <p><strong>Dirección de envío:</strong> {orden.direccionEnvio}</p> : null}
            </section>
            <section className="product-success-items">
              <h2 className="experience-panel-title">Tu selección</h2>
              {compra.productos.map((item, index) => (
                <article className="bp-contact-panel product-success-item" key={item.uuid ?? index}>
                  {item.imagenUrl ? <img src={item.imagenUrl} alt={item.productoNombre} className="product-success-image" /> : null}
                  <div>
                    <h3>{item.productoNombre}</h3>
                    {item.variacionNombre ? <p>Talla: {item.variacionNombre}</p> : null}
                    <p>Cantidad: {item.cantidad}</p>
                    <p>Precio unitario: Q{Number(item.precioUnitario).toFixed(2)}</p>
                    <strong>Subtotal: Q{Number(item.subtotal).toFixed(2)}</strong>
                  </div>
                </article>
              ))}
            </section>
          </div>
          <aside className="bp-contact-panel experience-receipt-totals">
            <span className="experience-eyebrow">Pago confirmado</span>
            <h2>Resumen</h2>
            <dl>
              <div><dt>Subtotal</dt><dd>Q{Number(orden.subtotal).toFixed(2)}</dd></div>
              <div><dt>Tarifa de servicio</dt><dd>Q{Number(orden.tarifaServicio).toFixed(2)}</dd></div>
              {Number(orden.costoEnvio) > 0 ? <div><dt>Envío</dt><dd>Q{Number(orden.costoEnvio).toFixed(2)}</dd></div> : null}
              <div className="experience-total"><dt>Total pagado</dt><dd>Q{Number(orden.total).toFixed(2)}</dd></div>
            </dl>
            <div className="product-success-actions">
              <Link className="bp-btn" to={`/${slug}/store`}>Seguir comprando ↗</Link>
              <Link className="bp-btn bp-btn-ghost" to={`/${slug}`}>Volver a la banda</Link>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default ProductCheckoutSuccess;
