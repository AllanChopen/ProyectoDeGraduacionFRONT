import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { getPublicEventDetail, mapEventoToDetail } from '../../src/api/eventosApi';
import { apiClient } from '../../src/api/apiClient';
import { calcularPrecioEvento } from '../../src/utils/eventPricing';
import '../BandPublic/BandPublic.css';
import './EventCheckout.css';

function EventCheckout() {
  const { slug, showId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(location.state?.show ?? null);
  const [quantity, setQuantity] = useState(location.state?.quantity ?? 1);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [loading, setLoading] = useState(!location.state?.show);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) return;
    getPublicEventDetail(slug, showId)
      .then((data) => setShow(mapEventoToDetail(data, showId)))
      .catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false));
  }, [show, showId, slug]);

  const price = useMemo(
    () => show ? calcularPrecioEvento(show.price, quantity) : null,
    [show, quantity]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      eventoId: show.id,
      cantidad: quantity,
      ...form,
    };

    console.log('CHECKOUT PAYLOAD:', payload);

    if (payload.eventoId === undefined || payload.eventoId === null || payload.eventoId === '') {
      setError('No se encontró el identificador del evento.');
      console.error('CHECKOUT ERROR: eventoId inválido', { show, payload });
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient('/api/Recurrente/checkout/evento', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('CHECKOUT RESPONSE:', response);

      const checkoutId = response?.recurrente?.checkoutId;
      const checkoutUrl = response?.recurrente?.checkoutUrl;

      if (!checkoutId || !checkoutUrl) {
        throw new Error('Respuesta de checkout inválida.');
      }

      localStorage.setItem('eventCheckout', JSON.stringify({
        checkoutId,
        slug,
        showId,
      }));

      window.location.href = checkoutUrl;
    } catch (submitError) {
      console.error('CHECKOUT ERROR:', submitError);
      console.error('BODY:', payload);
      setError(submitError.message || 'No se pudo iniciar el checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="bp-page"><NavBar /><LoadingState label="Cargando checkout..." /><Footer /></main>;
  if (!show) return <main className="bp-page"><NavBar /><section className="bp-section"><p>{error}</p></section><Footer /></main>;

  return (
    <main className="bp-page event-checkout-page">
      <NavBar />
      <section className="bp-section event-checkout-layout" aria-label="Checkout de tickets">
        <div className="event-checkout-event bp-contact-panel">
          {show.poster ? <img src={show.poster} alt={show.title} className="event-checkout-image" /> : null}
          <h1 className="bp-section-title show-title">Comprar tickets</h1>
          <h2>{show.title}</h2>
          <p className="bp-meta">{show.date} · {show.venue}</p>
          <div className="show-price-breakdown checkout-breakdown">
            <p><span>Q{show.price.toFixed(2)}</span><span>{quantity} × entrada</span></p>
            <p><span>Q{price.subtotal.toFixed(2)}</span><span>Subtotal</span></p>
            <p><span>Q{price.tarifaServicio.toFixed(2)}</span><span>Tarifa de servicio</span></p>
            <strong><span>Q{price.total.toFixed(2)}</span><span>Total</span></strong>
          </div>
        </div>
        <form className="bp-contact-panel event-checkout-form" onSubmit={handleSubmit}>
          <h2 className="bp-about-title">Datos del comprador</h2>
          {['nombre', 'email', 'telefono'].map((field) => (
            <label className="checkout-field" key={field}>
              {field === 'nombre' ? 'Nombre' : field === 'email' ? 'Email' : 'Teléfono'}
              <input className="bp-field" type={field === 'email' ? 'email' : 'text'} required value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
            </label>
          ))}
          <label className="checkout-field">Cantidad
            <input className="bp-field" type="number" min="1" max={show.capacity || undefined} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} />
          </label>
          {error ? <p className="checkout-error" role="alert">{error}</p> : null}
          <button className="bp-btn" type="submit" disabled={submitting}>{submitting ? 'Procesando...' : 'Pagar'}</button>
          <Link className="bp-btn bp-btn-ghost" to={`/${slug}/shows/${showId}`}>Volver al evento</Link>
        </form>
      </section>
      <Footer />
    </main>
  );
}

export default EventCheckout;
