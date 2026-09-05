import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
import NavBar from '../../Components/NavBar/NavBar';
import {
  createDashboardPost,
  deleteDashboardPost,
  getDashboardPosts,
  updateDashboardPost
} from '../../src/api/publicacionesApi';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

function formatDateLabel(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-ES');
}

function mapPostToItem(post) {
  return {
    id: post.id,
    title: post.titulo || 'Sin titulo',
    excerpt: post.contenido || '',
    image: post.imagenUrl || '',
    date: post.fechaPublicacion || post.createdAt || '',
    rawContent: post.contenido || ''
  };
}

function DashboardBlog() {
  const { slug = '' } = useParams();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardPosts();
      const mapped = data
        .map(mapPostToItem)
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime() || 0;
          const dateB = new Date(b.date).getTime() || 0;
          return dateB - dateA;
        });
      setItems(mapped);
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'No se pudieron cargar las publicaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  if (isLoading) {
    return (
      <main className="bp-page manage-page">
        <NavBar />
        <LoadingState label="Cargando publicaciones..." />
        <Footer />
      </main>
    );
  }

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus('');

    const payload = {
      titulo: title,
      contenido: description,
      imagenFile: imageFile || undefined,
    };

    try {
      if (editingId) {
        await updateDashboardPost(editingId, payload);
        setStatus('Noticia actualizada.');
      } else {
        await createDashboardPost(payload);
        setStatus('Noticia agregada.');
      }

      await loadItems();
      resetForm();
    } catch (error) {
      setStatus(error.message || 'No se pudo guardar la noticia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title ?? '');
    setDescription(item.rawContent ?? '');
    setImageFile(null);
    setStatus('Editando noticia.');
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('Estas seguro de eliminar esta noticia?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDashboardPost(id);
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      if (editingId === id) resetForm();
      setStatus('Noticia eliminada.');
    } catch (error) {
      setStatus(error.message || 'No se pudo eliminar la noticia.');
    }
  };

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Gestion de blog">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Gestionar Blog</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Crea y administra noticias con su contenido, fecha e imagen desde el endpoint de publicaciones.
          </p>
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard`} className="bp-btn bp-btn-small bp-btn-ghost">
              Volver al dashboard
            </Link>
          </div>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">{editingId ? 'Editar noticia' : 'Nueva noticia'}</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input className="bp-field" placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <textarea
                className="bp-field manage-textarea"
                placeholder="Contenido"
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
                  {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar noticia'}
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
                    <p className="bp-meta">{formatDateLabel(item.date)}</p>
                    <p className="bp-meta manage-item-description">{item.excerpt}</p>
                    <div className="manage-actions">
                      <Link to={`/${slug}/blog/${item.id}`} className="bp-btn bp-btn-small">
                        Ver noticia completa
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
