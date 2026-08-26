import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import NavBar from '../../Components/NavBar/NavBar';
import {
  getManagedPosts,
  saveManagedPosts
} from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

function DashboardBlog() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setItems(getManagedPosts());
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setDescription('');
    setImage('');
    setDate('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const entry = {
      id: editingId ?? Date.now(),
      title,
      excerpt,
      date: date || 'Sin fecha',
      image,
      link: '#',
      content: description
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    };

    const next = editingId
      ? items.map((item) => (item.id === editingId ? entry : item))
      : [entry, ...items];

    setItems(next);
    saveManagedPosts(next);
    setStatus(editingId ? 'Noticia actualizada.' : 'Noticia agregada.');
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title ?? '');
    setExcerpt(item.excerpt ?? '');
    setDescription((item.content ?? []).join('\n'));
    setImage(item.image ?? '');
    setDate(item.date ?? '');
    setStatus('Editando noticia.');
  };

  const handleDelete = (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    saveManagedPosts(next);
    if (editingId === id) resetForm();
    setStatus('Noticia eliminada.');
  };

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Gestion de blog">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Gestionar Blog</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Crea noticias con imagen, extracto y contenido por parrafos. Puedes ver cada nota en su pagina publica.
          </p>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">{editingId ? 'Editar noticia' : 'Nueva noticia'}</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input className="bp-field" placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input className="bp-field" placeholder="Fecha" value={date} onChange={(e) => setDate(e.target.value)} required />
              <textarea
                className="bp-field manage-textarea"
                placeholder="Extracto"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
              <textarea
                className="bp-field manage-textarea"
                placeholder="Contenido (separa parrafos con saltos de linea)"
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
                  {editingId ? 'Guardar cambios' : 'Agregar noticia'}
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
            <h2 className="bp-about-title">Noticias ({items.length})</h2>
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
                    <p className="bp-meta">{item.date}</p>
                    <p className="bp-meta">{item.excerpt}</p>
                    <div className="manage-actions">
                      <Link to={`/blog/${item.id}`} className="bp-btn bp-btn-small">
                        Ver noticia
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

export default DashboardBlog;
