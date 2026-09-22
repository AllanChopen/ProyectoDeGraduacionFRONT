import { Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import { useCart } from '../../src/context/CartContext';
import { calcularPrecioEvento } from '../../src/utils/eventPricing';
import '../BandPublic/BandPublic.css';
import './TicketCart.css';

function TicketCart() {
  const {
    ticketItems,
    updateTicketQuantity,
    removeTicketItem,
    clearTicketCart,
    ticketTotalItems
  } = useCart();

  const isEmpty = ticketItems.length === 0;
  const ticketPrices = ticketItems.map((item) => ({
    ...item,
    price: calcularPrecioEvento(item.precioEntrada ?? item.unitPrice, item.quantity),
  }));
  const ticketServiceFees = ticketPrices.reduce((sum, item) => sum + item.price.tarifaServicio, 0);
  const ticketGrandTotal = ticketPrices.reduce((sum, item) => sum + item.price.total, 0);

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
              {ticketPrices.map((item) => (
                <article className="ticket-cart-item" key={item.eventoId ?? item.showId}>
                  {item.poster ? (
                    <img src={item.poster} alt={item.name} className="ticket-cart-item-image" />
                  ) : (
                    <div className="ticket-cart-item-image bp-image-placeholder" aria-hidden="true" />
                  )}
                  <div>
                    <strong>{item.name}</strong>
                    <p className="bp-meta">Ticket general</p>
                    {item.date ? <p className="bp-meta">{item.date}{item.venue ? ` · ${item.venue}` : ''}</p> : null}
                    <p className="bp-meta">{item.quantity} × Q{Number(item.precioEntrada ?? item.unitPrice).toFixed(2)}</p>
                    <p className="bp-meta">Subtotal: Q{item.price.subtotal.toFixed(2)}</p>
                    <p className="bp-meta">Tarifa: Q{item.price.tarifaServicio.toFixed(2)}</p>
                    <p className="ticket-cart-line-total">Total: Q{item.price.total.toFixed(2)}</p>
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
              <p className="ticket-cart-total">Subtotal: Q{ticketPrices.reduce((sum, item) => sum + item.price.subtotal, 0).toFixed(2)}</p>
              <p className="bp-meta">Tarifa de servicio: Q{ticketServiceFees.toFixed(2)}</p>
              <p className="ticket-cart-total">Total: Q{ticketGrandTotal.toFixed(2)}</p>
              <button type="button" className="bp-btn ticket-cart-pay" disabled>
                Listo para pagar
              </button>
              <p className="bp-meta ticket-cart-payment-note">El pago se conectará próximamente.</p>
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
