import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import NavBar from '../../Components/NavBar/NavBar';
import {
  getManagedShows,
  saveManagedShows
} from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

function DashboardShows() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [statusLabel, setStatusLabel] = useState('Boletos disponibles');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setItems(getManagedShows());
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setVenue('');
    setLocation('');
    setDate('');
    setStatusLabel('Boletos disponibles');
    setDescription('');
    setImage('');
    setTicketPrice('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsedPrice = Number(ticketPrice) || 0;

    const entry = {
      id: editingId ?? Date.now(),
      title,
      venue,
      location,
      date,
      status: statusLabel,
      description,
      poster: image,
      link: '#',
      ticketTypes: [
        {
          id: `${editingId ?? Date.now()}-general`,
          label: 'General',
          price: parsedPrice,
          stock: 120
        }
      ]
    };

    const next = editingId
      ? items.map((item) => (item.id === editingId ? entry : item))
      : [entry, ...items];

    setItems(next);
    saveManagedShows(next);
    setStatus(editingId ? 'Show actualizado.' : 'Show agregado.');
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title ?? '');
    setVenue(item.venue ?? '');
    setLocation(item.location ?? '');
    setDate(item.date ?? '');
    setStatusLabel(item.status ?? 'Boletos disponibles');
    setDescription(item.description ?? '');
    setImage(item.poster ?? '');
    setTicketPrice(String(item.ticketTypes?.[0]?.price ?? 0));
    setStatus('Editando show.');
  };

  const handleDelete = (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    saveManagedShows(next);
    if (editingId === id) resetForm();
    setStatus('Show eliminado.');
  };

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Gestion de shows">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Gestionar Shows</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Administra fechas, descripcion e imagen. Cada show mantiene su boton para comprar tickets.
          </p>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">{editingId ? 'Editar show' : 'Nuevo show'}</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input className="bp-field" placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input className="bp-field" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
              <input className="bp-field" placeholder="Ciudad / ubicacion" value={location} onChange={(e) => setLocation(e.target.value)} required />
              <input className="bp-field" placeholder="Fecha" value={date} onChange={(e) => setDate(e.target.value)} required />
              <input className="bp-field" placeholder="Estado" value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)} required />
              <input
                className="bp-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio ticket base"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                required
              />
              <textarea
                className="bp-field manage-textarea"
                placeholder="Descripcion"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                className="bp-field"
                placeholder="URL de imagen"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <div className="manage-actions">
                <button type="submit" className="bp-btn bp-btn-small">
                  {editingId ? 'Guardar cambios' : 'Agregar show'}
                </button>
                {editingId ? (
                  <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={resetForm}>
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
            <p className="manage-status">{status}</p>
          </article>

          <article className="bp-contact-panel">
            <h2 className="bp-about-title">Shows ({items.length})</h2>
            <div className="manage-list">
              {items.map((item) => (
                <article className="manage-item" key={item.id}>
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="manage-item-image" />
                  ) : (
                    <div className="manage-item-image" aria-hidden="true" />
                  )}
                  <div className="manage-item-copy">
                    <strong>{item.title}</strong>
                    <p className="bp-meta">{item.venue}</p>
                    <p className="bp-meta">{item.location}</p>
                    <p className="bp-meta">{item.date}</p>
                    <p className="bp-meta">{item.description}</p>
                    <div className="manage-actions">
                      <Link to={`/shows/${item.id}`} className="bp-btn bp-btn-small">
                        Ver show
                      </Link>
                      <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={() => startEdit(item)}>
                        Editar
                      </button>
                      <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={() => handleDelete(item.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default DashboardShows;
