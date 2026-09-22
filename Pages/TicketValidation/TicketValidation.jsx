import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import { apiClient } from '../../src/api/apiClient';
import '../BandPublic/BandPublic.css';
import './TicketValidation.css';

function TicketValidation() {
  const { codigoQr } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');

  const cargarTicket = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient(`/api/Tickets/qr/${codigoQr}`);
      setTicket(response?.ticket ?? null);
      setError('');
    } catch {
      setTicket(null);
      setError('Ticket no encontrado.');
    } finally {
      setLoading(false);
    }
  }, [codigoQr]);

  useEffect(() => {
    cargarTicket();
  }, [cargarTicket]);

  const handleCanjear = async () => {
    setRedeeming(true);
    setError('');
    try {
      await apiClient(`/api/Tickets/qr/${codigoQr}/canjear`, { method: 'POST' });
      await cargarTicket();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo canjear el ticket.');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return <main className="bp-page"><NavBar /><LoadingState label="Validando ticket..." /><Footer /></main>;
  }

  if (error && !ticket) {
    return (
      <main className="bp-page">
        <NavBar />
        <section className="bp-section ticket-validation-error">
          <h1>Ticket inválido</h1>
          <p>{error}</p>
        </section>
        <Footer />
      </main>
    );
  }

  const event = ticket.evento;
  return (
    <main className="bp-page">
      <NavBar />
      <section className="bp-section ticket-validation-section">
        <div className={`bp-contact-panel ticket-validation-card ${ticket.estado ? 'ticket-is-valid' : 'ticket-is-used'}`}>
          <h1>{ticket.estado ? 'Ticket válido' : 'Ticket utilizado'}</h1>
          <h2>{event?.nombre}</h2>
          <p>Fecha: {event?.fecha ? new Date(event.fecha).toLocaleDateString('es-GT') : '—'}</p>
          <p>Hora: {event?.hora?.slice(0, 5) || '—'}</p>
          <p>Ubicación: {event?.ubicacion || '—'}</p>
          <p>Código:<br /><strong>{ticket.codigoQr}</strong></p>
          {ticket.usedDate ? <p>Utilizado: {new Date(ticket.usedDate).toLocaleString('es-GT')}</p> : null}
          {ticket.estado ? (
            <button className="bp-btn" type="button" onClick={handleCanjear} disabled={redeeming}>
              {redeeming ? 'Canjeando...' : 'Canjear ticket'}
            </button>
          ) : null}
          {error ? <p className="checkout-error" role="alert">{error}</p> : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default TicketValidation;
