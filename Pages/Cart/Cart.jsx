import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { useCart } from '../../src/context/CartContext';
import '../BandPublic/BandPublic.css';
import './Cart.css';
import { apiClient } from '../../src/api/apiClient';
import { getPublicBand, mapBand } from '../../src/api/bandApi';
import { getPublicProducts } from '../../src/api/productosApi';
import { calcularPrecioProductos } from '../../src/utils/productPricing';

function Cart() {
  const {
    merchItems,
    merchSubtotal,
    updateMerchQuantity,
    removeMerchItem,
    clearMerchCart,
    merchTotalItems
  } = useCart();
  const { slug: routeSlug } = useParams();
  const [checkoutError, setCheckoutError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [band, setBand] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccionEnvio: '' });

  const isEmpty = merchItems.length === 0;
  const slug = routeSlug || merchItems[0]?.slug;
  useEffect(() => {
    if (!slug) return;
    getPublicBand(slug).then((data) => setBand(mapBand(data))).catch(() => setBand(null));
  }, [slug]);
  const price = calcularPrecioProductos(merchSubtotal, band?.precioEnvio ?? 0);

  const handleCheckout = async () => {
    if (!slug || merchItems.length === 0) return;
    setCheckingOut(true);
    setCheckoutError('');
    try {
      console.log('MERCH ITEM REAL:', merchItems[0]);
      const catalog = await getPublicProducts(slug);
      const catalogByUuid = new Map(catalog.map((product) => [product.uuid, product.id]));
      const catalogByName = new Map(catalog.map((product) => [product.nombre, product.id]));
      const payload = {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        direccionEnvio: form.direccionEnvio,
        items: merchItems.map((item) => ({
          id: (() => {
            const rawProductId = item.productoId ?? item.productId ?? item.id;
            const numericId = Number(rawProductId);
            return Number.isInteger(numericId) && numericId > 0
              ? numericId
              : Number(catalogByUuid.get(rawProductId) ?? catalogByName.get(item.name));
          })(),
          variacionId: (item.variacionId ?? item.variantId) != null
            ? Number(item.variacionId ?? item.variantId)
            : null,
          cantidad: Number(item.cantidad ?? item.quantity ?? 1),
        })),
      };

      const invalidItem = payload.items.find((item) => !Number.isInteger(item.id) || item.id < 1);
      if (invalidItem) {
        console.error('PRODUCT CHECKOUT INVALID ITEM:', { invalidItem, merchItems, payload });
        throw new Error('Hay un producto antiguo o inválido en el carrito. Quítalo y agrégalo nuevamente desde la tienda.');
      }

      console.log('PRODUCT CHECKOUT BODY:', payload);
      const response = await apiClient('/api/Recurrente/checkout/productos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const checkoutId = response?.recurrente?.checkoutId;
      const checkoutUrl = response?.recurrente?.checkoutUrl;
      if (!checkoutId || !checkoutUrl) throw new Error('Respuesta de checkout inválida.');
      const checkoutData = { checkoutId, slug };
      localStorage.setItem('productCheckout', JSON.stringify(checkoutData));
      console.log('PRODUCT CHECKOUT SAVED:', checkoutData);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('PRODUCT CHECKOUT ERROR:', error);
      setCheckoutError(error.message || 'No se pudo iniciar el checkout.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <main className="bp-page cart-page">
      <NavBar />

      <section className="bp-section" aria-label="Carrito de merch">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Carrito de compras</h1>
          <div className="bp-divider" />
          <p className="cart-subtitle">Aquí puedes ver y gestionar los productos de tu carrito de compras.</p>
        </div>

        {isEmpty ? (
          <div className="bp-contact-panel cart-empty">
            <p className="bp-meta">Tu carrito de merch esta vacio.</p>
            <Link to={slug ? `/${slug}/store` : "/"} className="bp-btn">
              Ir a tienda
            </Link>
          </div>
        ) : (
          <div className="bp-container cart-layout">
            <div className="bp-contact-panel cart-items">
              {merchItems.map((item) => (
                <article className="cart-item" key={`${item.productId}-${item.variantId}`}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                  ) : null}
                  <div>
                    <strong>{item.name}</strong>
                    <p className="bp-meta">{item.variantLabel}</p>
                    <p className="bp-meta">Q{item.unitPrice.toFixed(2)} c/u</p>
                  </div>

                  <div className="cart-item-actions">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      className="bp-field cart-qty"
                      onChange={(event) => {
                        const quantity = Number(event.target.value);
                        if (Number.isNaN(quantity) || quantity < 1) return;
                        updateMerchQuantity(item.productId, item.variantId, quantity);
                      }}
                    />
                    <button
                      type="button"
                      className="bp-btn bp-btn-small bp-btn-ghost"
                      onClick={() => removeMerchItem(item.productId, item.variantId)}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="bp-contact-panel cart-summary">
              <h2 className="bp-about-title">Resumen</h2>
              <p className="bp-meta">Items: {merchTotalItems}</p>
              <div className="cart-price-breakdown">
                <p><span>Q{price.subtotal.toFixed(2)}</span><span>Productos</span></p>
                <p><span>Q{price.tarifaServicio.toFixed(2)}</span><span>Tarifa de servicio</span></p>
                {price.costoEnvio > 0 ? <p><span>Q{price.costoEnvio.toFixed(2)}</span><span>Envío</span></p> : null}
                <strong><span>Q{price.total.toFixed(2)}</span><span>Total</span></strong>
              </div>
              <div className="cart-checkout-fields">
                {[
                  ['nombre', 'Nombre', 'text'],
                  ['email', 'Email', 'email'],
                  ['telefono', 'Teléfono', 'tel'],
                  ['direccionEnvio', 'Dirección de envío', 'text'],
                ].map(([field, label, type]) => (
                  <label key={field}>
                    {label}
                    <input
                      className="bp-field"
                      type={type}
                      required
                      value={form[field]}
                      onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                    />
                  </label>
                ))}
              </div>
              <button type="button" className="bp-btn" onClick={handleCheckout} disabled={checkingOut || !slug || !form.nombre || !form.email || !form.telefono || !form.direccionEnvio}>
                {checkingOut ? 'Procesando...' : 'Pagar'}
              </button>
              {checkoutError ? <p className="checkout-error" role="alert">{checkoutError}</p> : null}
              <button type="button" className="bp-btn" onClick={clearMerchCart}>
                Vaciar carrito
              </button>
              <Link to={slug ? `/${slug}/store` : "/"} className="bp-btn bp-btn-ghost">
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default Cart;
