import { useEffect, useState } from 'react';
import Footer from '../../Components/Footer/Footer';
import NavBar from '../../Components/NavBar/NavBar';
import { useAuth } from '../../src/context/AuthContext';
import {
  createDashboardEvent,
  deleteDashboardEvent,
  getDashboardEvents,
  updateDashboardEvent
} from '../../src/api/eventosApi';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

function formatDateLabel(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-ES');
}

function formatTimeLabel(value) {
  if (!value) return 'Sin hora';
  const match = String(value).match(/^(\d{2}:\d{2})/);
  return match ? match[1] : value;
}

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function mapEventToItem(event) {
  return {
    id: event.id,
    title: event.nombre || 'Sin titulo',
    venue: event.ubicacion || 'Sin ubicacion',
    location: event.ubicacion || 'Sin ubicacion',
    mapsUrl: event.ubicacionUrl || '',
    date: event.fecha || '',
    time: event.hora || '',
    status: event.estado || 'Sin estado',
    description: event.descripcion || '',
    image: event.imagenUrl || '',
    capacity: Number(event.capacidad ?? 0),
    ticketPrice: Number(event.precioEntrada ?? 0)
  };
}

function DashboardShows() {
  const { bandaId } = useAuth();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [statusLabel, setStatusLabel] = useState('programado');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardEvents();
      const mapped = data
        .map(mapEventToItem)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime() || 0;
          const dateB = new Date(b.date).getTime() || 0;
          return dateB - dateA;
        });
      setItems(mapped);
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'No se pudieron cargar los shows.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setLocation('');
    setLocationUrl('');
    setDate('');
    setTime('');
    setStatusLabel('programado');
    setDescription('');
    setImageFile(null);
    setCapacity('');
    setTicketPrice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!bandaId) {
      setStatus('No se encontro el identificador de la banda en la sesion.');
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    const payload = {
      bandaId: Number(bandaId),
      nombre: title,
      descripcion: description,
      fecha: date ? new Date(`${date}T00:00:00`).toISOString() : new Date().toISOString(),
      hora: time ? `${time}:00` : '00:00:00',
      ubicacion: location,
      ubicacionUrl: locationUrl,
      capacidad: Number(capacity) || 0,
      precioEntrada: Number(ticketPrice) || 0,
      estado: statusLabel,
      imagenFile: imageFile || undefined,
    };

    try {
      if (editingId) {
        await updateDashboardEvent(editingId, payload);
        setStatus('Show actualizado.');
      } else {
        await createDashboardEvent(payload);
        setStatus('Show agregado.');
      }

      await loadItems();
      resetForm();
    } catch (error) {
      setStatus(error.message || 'No se pudo guardar el show.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title ?? '');
    setLocation(item.location ?? '');
    setLocationUrl(item.mapsUrl ?? '');
    setDate(toDateInputValue(item.date));
    setTime(formatTimeLabel(item.time));
    setStatusLabel(item.status ?? 'programado');
    setDescription(item.description ?? '');
    setImageFile(null);
    setCapacity(String(item.capacity ?? 0));
    setTicketPrice(String(item.ticketPrice ?? 0));
    setStatus('Editando show.');
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('Estas seguro de eliminar este show?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDashboardEvent(id);
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      if (editingId === id) resetForm();
      setStatus('Show eliminado.');
    } catch (error) {
      setStatus(error.message || 'No se pudo eliminar el show.');
    }
  };

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Gestion de shows">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Gestionar Shows</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Administra fechas, hora, ubicacion, capacidad, precio, estado e imagen desde el endpoint de eventos.
          </p>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">{editingId ? 'Editar show' : 'Nuevo show'}</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input className="bp-field" placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input className="bp-field" placeholder="Ubicacion" value={location} onChange={(e) => setLocation(e.target.value)} required />
              <input className="bp-field" placeholder="URL de ubicacion" value={locationUrl} onChange={(e) => setLocationUrl(e.target.value)} />
              <input className="bp-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              <input className="bp-field" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              <select className="bp-field" value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)}>
                <option value="programado">programado</option>
                <option value="cancelado">cancelado</option>
                <option value="agotado">agotado</option>
              </select>
              <input
                className="bp-field"
                type="number"
                min="0"
                step="1"
                placeholder="Capacidad"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
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
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <div className="manage-actions">
                <button type="submit" className="bp-btn bp-btn-small" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar show'}
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
            {isLoading ? <p className="bp-meta">Cargando shows...</p> : null}
            <div className="manage-list">
              {items.map((item) => (
                <article className="manage-item" key={item.id}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="manage-item-image" />
                  ) : (
                    <div className="manage-item-image" aria-hidden="true" />
                  )}
                  <div className="manage-item-copy">
                    <strong>{item.title}</strong>
                    <p className="bp-meta">{item.location}</p>
                    <p className="bp-meta">{formatDateLabel(item.date)} - {formatTimeLabel(item.time)}</p>
                    <p className="bp-meta">Capacidad: {item.capacity}</p>
                    <p className="bp-meta">Precio: Q{item.ticketPrice.toFixed(2)}</p>
                    <p className="bp-meta">Estado: {item.status}</p>
                    <p className="bp-meta">{item.description}</p>
                    <div className="manage-actions">
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
