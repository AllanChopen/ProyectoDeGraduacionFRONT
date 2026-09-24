import '../../Components/BandExperience/BandExperience.css';
import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { getPublicEventDetail, mapEventoToDetail } from '../../src/api/eventosApi';
import { calcularPrecioEvento } from '../../src/utils/eventPricing';
import '../BandPublic/BandPublic.css';
import './ShowDetail.css';

function ShowDetail() {
  const { slug, showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadShow = async () => {
      try {
        setLoading(true);
        const data = await getPublicEventDetail(slug, showId);
        const mappedShow = mapEventoToDetail(data, showId);
        setShow(mappedShow);
      } catch (err) {
        console.error('Error loading show:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug && showId) {
      loadShow();
    }
  }, [slug, showId]);

  const ticketTypes = show?.ticketTypes?.length
    ? show.ticketTypes
    : [
        {
          id: `show-${show?.id}-general`,
          label: 'General',
          price: show?.price ?? 0,
          stock: show?.availableTickets ?? 0
        }
      ];

  const defaultTicketType = ticketTypes[0] ?? null;
  const [selectedTicketId, setSelectedTicketId] = useState(defaultTicketType?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  const selectedTicket = useMemo(() => {
    if (!show) return null;
    return ticketTypes.find((ticket) => ticket.id === selectedTicketId) ?? ticketTypes[0];
  }, [show, selectedTicketId, ticketTypes]);

  if (loading) {
    return (
      <main className="bp-page bp-experience show-detail-page">
        <NavBar />
        <LoadingState label="Cargando show..." />
        <Footer />
      </main>
    );
  }

  if (error || !show) {
    return (
      <main className="bp-page bp-experience show-detail-page">
        <NavBar />
        <section className="bp-section" aria-label="Show no encontrado">
          <div className="bp-section-header">
            <h1 className="bp-section-title">Show no encontrado</h1>
            <div className="bp-divider" />
            <p className="show-subtitle">Este show no existe o ya no esta disponible.</p>
          </div>
          <div className="bp-more-wrap">
            <Link to={`/${slug}/shows`} className="bp-btn">
              Volver a shows
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const handleProceedToCheckout = () => {
    if (!selectedTicket) return;
    navigate(`/${slug}/checkout/${show.id}`, {
      state: { show, ticketPrice: selectedTicket.price, quantity }
    });
  };

  const precio = selectedTicket ? calcularPrecioEvento(selectedTicket.price, quantity) : null;

  return (
    <main className="bp-page bp-experience show-detail-page">
      <NavBar />

      <section className="bp-section show-layout" aria-label={`Compra de tickets para ${show.title}`}>
        <nav className="experience-breadcrumb" aria-label="Ruta de navegación"><Link to={`/${slug}`}>La banda</Link><span aria-hidden="true">/</span><Link to={`/${slug}/shows`}>Shows</Link><span aria-hidden="true">/</span><span>El evento</span></nav>
        <div className="show-media">
          <div className="experience-photo-label"><span>LIVE / FRENTE AL ESCENARIO</span><span aria-hidden="true">✳</span></div>
          {show.poster ? (
            <img src={show.poster} alt={show.title} className="show-main-image" />
          ) : (
            <div className="show-main-image bp-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <article className="show-info bp-contact-panel">
          <p className="show-type">Tickets</p>
          <h1 className="bp-section-title show-title">{show.title}</h1>

          <div className="show-top-actions">
            <Link to={`/${slug}/shows`} className="bp-btn bp-btn-small bp-btn-ghost">
              Regresar a shows
            </Link>
          </div>

          <div className="show-meta-grid">
            <p className="bp-meta">Lugar: {show.venue}</p>
            <p className="bp-meta">Fecha: {show.date}</p>
            <p className="bp-meta">Hora: {show.time}</p>
            <p className="bp-meta">Capacidad: {show.capacity}</p>
            <p className="bp-meta">Estado: {show.status}</p>
            <p className="bp-meta">Precio base: Q{Number(show.price ?? 0).toFixed(2)}</p>
          </div>

          <div className="show-field">
            <label htmlFor="ticketType" className="show-label">
              Tipo de ticket
            </label>
            <select
              id="ticketType"
              className="bp-field show-select"
              value={selectedTicket?.id ?? ''}
              onChange={(event) => setSelectedTicketId(event.target.value)}
            >
              {ticketTypes.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.label} - Q{ticket.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="show-field show-row">
            <div>
              <label htmlFor="ticketQty" className="show-label">
                Cantidad
              </label>
              <input
                id="ticketQty"
                type="number"
                min="1"
                max={selectedTicket?.stock ?? 1}
                value={quantity}
                className="bp-field show-qty"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isNaN(next) || next < 1) return setQuantity(1);
                  const max = selectedTicket?.stock ?? 1;
                  setQuantity(next > max ? max : next);
                }}
              />
            </div>

            <div className="show-stock">
              <span>Disponibles</span>
              <strong>{selectedTicket?.stock ?? 0}</strong>
            </div>
          </div>

          <div className="show-price-wrap">
            <div className="show-price-breakdown">
              <p><span>Q{selectedTicket?.price.toFixed(2)}</span><span>{quantity} × entrada</span></p>
              <p><span>Q{precio?.subtotal.toFixed(2)}</span><span>Subtotal</span></p>
              <p><span>Q{precio?.tarifaServicio.toFixed(2)}</span><span>Tarifa de servicio</span></p>
              <strong><span>Q{precio?.total.toFixed(2)}</span><span>Total</span></strong>
            </div>
          </div>

          <div className="show-actions">
            <button type="button" className="bp-btn" onClick={handleProceedToCheckout}>
              Proceder con la compra
            </button>
            {show.mapsUrl ? (
              <a
                href={show.mapsUrl}
                className="bp-btn bp-btn-ghost"
                target="_blank"
                rel="noreferrer"
              >
                Ver Google Maps
              </a>
            ) : null}
            <Link to={`/${slug}/shows`} className="bp-btn bp-btn-ghost">
              Ver mas shows
            </Link>
          </div>

        </article>
        {show.description ? <section className="experience-show-story" aria-label="Acerca del show"><span className="experience-eyebrow">Detrás de esta fecha</span><h2>El encuentro.</h2><p className="show-description">{show.description}</p></section> : null}
      </section>

      <Footer />
    </main>
  );
}

export default ShowDetail;
