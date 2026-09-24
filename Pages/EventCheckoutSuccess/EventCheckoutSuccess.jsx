import PurchaseProgress from '../../Components/BandExperience/PurchaseProgress';
import '../../Components/BandExperience/BandExperience.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { apiClient } from '../../src/api/apiClient';
import '../BandPublic/BandPublic.css';
import './EventCheckoutSuccess.css';

function EventCheckoutSuccess() {
  const { slug } = useParams();
  const [compra, setCompra] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('eventCheckout');
    if (!stored) {
      setError('No se encontró información del checkout.');
      setLoading(false);
      return undefined;
    }

    let checkoutId;
    try {
      checkoutId = JSON.parse(stored)?.checkoutId;
    } catch {
      setError('La información del checkout no es válida.');
      setLoading(false);
      return undefined;
    }

    if (!checkoutId) {
      setError('No se encontró el identificador del checkout.');
      setLoading(false);
      return undefined;
    }

    let intervalId;
    const consultarCheckout = async () => {
      try {
        const response = await apiClient(`/api/Tickets/checkout/${checkoutId}`);
        if (response?.estadoPago === 'pagado') {
          setCompra(response);
          setLoading(false);
          clearInterval(intervalId);
          localStorage.removeItem('eventCheckout');
        }
      } catch (requestError) {
        console.error('Error consultando checkout:', requestError);
      }
    };

    consultarCheckout();
    intervalId = setInterval(consultarCheckout, 2000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <main className="bp-page bp-experience"><NavBar /><LoadingState label="Confirmando tu pago..." /><Footer /></main>;
  }

  if (error || !compra) {
    return (
      <main className="bp-page bp-experience">
        <NavBar />
        <section className="bp-section checkout-success-error">
          <h1>No pudimos cargar tu compra</h1>
          <p>{error || 'El pago todavía no está confirmado.'}</p>
          <Link className="bp-btn" to={`/${slug}`}>Volver a la banda</Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bp-page bp-experience event-success-page">
      <NavBar />
      <section className="bp-section">
        <div className="event-success-header experience-success-header">
          <span className="experience-success-mark" aria-hidden="true">✓</span>
          <span className="experience-eyebrow">Live / Pago confirmado</span>
          <h1>NOS VEMOS <em>AHÍ.</em></h1>
          <p>Tu compra fue procesada correctamente. Tus entradas están aquí.</p>
        </div>
        <PurchaseProgress confirmed />

        <div className="bp-contact-panel event-success-summary">
          <h2>{compra.evento?.nombre}</h2>
          <p>
            {compra.evento?.fecha
              ? new Date(compra.evento.fecha).toLocaleDateString('es-GT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : null}
          </p>
          {compra.evento?.hora ? <p>Hora: {compra.evento.hora.slice(0, 5)}</p> : null}
          {compra.evento?.ubicacion ? <p>Ubicación: {compra.evento.ubicacion}</p> : null}
          <p>Entradas: {compra.compra?.cantidadEntradas}</p>
          <strong>Total pagado: Q{Number(compra.compra?.total ?? 0).toFixed(2)}</strong>
        </div>

        <section className="event-success-tickets">
          <h2>Tus entradas</h2>
          <p className="experience-form-note">Presenta el código QR de cada entrada al ingresar al show.</p>
          <div className="experience-ticket-grid">
          {compra.tickets?.map((ticket, index) => {
            const ticketUrl = `${window.location.origin}/ticket/${ticket.codigoQr}`;
            return (
              <article className="bp-contact-panel event-ticket-card" key={ticket.uuid ?? ticket.codigoQr}>
                <h3>Entrada #{index + 1}</h3>
                <QRCodeSVG value={ticketUrl} size={220} />
                <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                  Abrir ticket
                </a>
                <p>Código:<br /><strong>{ticket.codigoQr}</strong></p>
                <p>Estado: <strong>{ticket.estado ? 'Válida' : 'Utilizada'}</strong></p>
              </article>
            );
          })}
          </div>
        </section>

        <Link className="bp-btn" to={`/${slug}`}>Volver a {slug}</Link>
      </section>
      <Footer />
    </main>
  );
}

export default EventCheckoutSuccess;
