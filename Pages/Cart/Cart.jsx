import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { useCart } from '../../src/context/CartContext';
import '../BandPublic/BandPublic.css';
import './Cart.css';

function Cart() {
  const {
    merchItems,
    merchSubtotal,
    updateMerchQuantity,
    removeMerchItem,
    clearMerchCart,
    merchTotalItems
  } = useCart();

  const isEmpty = merchItems.length === 0;

  return (
    <main className="bp-page cart-page">
      <NavBar />

      <section className="bp-section" aria-label="Carrito de merch">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Carrito Merch</h1>
          <div className="bp-divider" />
          <p className="cart-subtitle">Aqui solo se muestran productos de merch, separado del carrito de tickets.</p>
        </div>

        {isEmpty ? (
          <div className="bp-contact-panel cart-empty">
            <p className="bp-meta">Tu carrito de merch esta vacio.</p>
            <Link to="/tienda" className="bp-btn">
              Ir a tienda
            </Link>
          </div>
        ) : (
          <div className="bp-container cart-layout">
            <div className="bp-contact-panel cart-items">
              {merchItems.map((item) => (
                <article className="cart-item" key={`${item.productId}-${item.variantId}`}>
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
              <p className="cart-total">Subtotal: Q{merchSubtotal.toFixed(2)}</p>
              <button type="button" className="bp-btn" onClick={clearMerchCart}>
                Vaciar carrito
              </button>
              <Link to="/tienda" className="bp-btn bp-btn-ghost">
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
