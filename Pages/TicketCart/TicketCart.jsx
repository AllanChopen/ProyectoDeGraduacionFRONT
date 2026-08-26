import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { useCart } from '../../src/context/CartContext';
import '../BandPublic/BandPublic.css';
import './TicketCart.css';

function TicketCart() {
  const {
    ticketItems,
    ticketSubtotal,
    updateTicketQuantity,
    removeTicketItem,
    clearTicketCart,
    ticketTotalItems
  } = useCart();

  const isEmpty = ticketItems.length === 0;

  return (
    <main className="bp-page ticket-cart-page">
      <NavBar />

      <section className="bp-section" aria-label="Carrito de tickets">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Carrito Tickets</h1>
          <div className="bp-divider" />
          <p className="ticket-cart-subtitle">
            Este carrito es exclusivo para boletos de shows y no se mezcla con merch.
          </p>
        </div>

        {isEmpty ? (
          <div className="bp-contact-panel ticket-cart-empty">
            <p className="bp-meta">Tu carrito de tickets esta vacio.</p>
            <Link to="/shows" className="bp-btn">
              Ver shows
            </Link>
          </div>
        ) : (
          <div className="bp-container ticket-cart-layout">
            <div className="bp-contact-panel ticket-cart-items">
              {ticketItems.map((item) => (
                <article className="ticket-cart-item" key={`${item.showId}-${item.variantId}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="bp-meta">Ticket: {item.variantLabel}</p>
                    <p className="bp-meta">Q{item.unitPrice.toFixed(2)} c/u</p>
                  </div>

                  <div className="ticket-cart-item-actions">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      className="bp-field ticket-cart-qty"
                      onChange={(event) => {
                        const quantity = Number(event.target.value);
                        if (Number.isNaN(quantity) || quantity < 1) return;
                        updateTicketQuantity(item.showId, item.variantId, quantity);
                      }}
                    />
                    <button
                      type="button"
                      className="bp-btn bp-btn-small bp-btn-ghost"
                      onClick={() => removeTicketItem(item.showId, item.variantId)}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="bp-contact-panel ticket-cart-summary">
              <h2 className="bp-about-title">Resumen</h2>
              <p className="bp-meta">Tickets: {ticketTotalItems}</p>
              <p className="ticket-cart-total">Subtotal: Q{ticketSubtotal.toFixed(2)}</p>
              <button type="button" className="bp-btn" onClick={clearTicketCart}>
                Vaciar carrito
              </button>
              <Link to="/shows" className="bp-btn bp-btn-ghost">
                Seguir viendo shows
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default TicketCart;
