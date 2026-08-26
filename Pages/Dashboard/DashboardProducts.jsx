import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import NavBar from '../../Components/NavBar/NavBar';
import {
  getManagedProducts,
  saveManagedProducts
} from '../BandPublic/bandPublicData';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

function DashboardProducts() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setItems(getManagedProducts());
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setType('');
    setPrice('');
    setDescription('');
    setImage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsedPrice = Number(price) || 0;

    const entry = {
      id: editingId ?? Date.now(),
      name,
      type,
      price: parsedPrice,
      description,
      image,
      link: '#',
      variants: [
        {
          id: `${editingId ?? Date.now()}-default`,
          label: 'Presentacion unica',
          price: parsedPrice,
          stock: 25
        }
      ]
    };

    const next = editingId
      ? items.map((item) => (item.id === editingId ? entry : item))
      : [entry, ...items];

    setItems(next);
    saveManagedProducts(next);
    setStatus(editingId ? 'Producto actualizado.' : 'Producto agregado.');
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name ?? '');
    setType(item.type ?? '');
    setPrice(String(item.price ?? 0));
    setDescription(item.description ?? '');
    setImage(item.image ?? '');
    setStatus('Editando producto.');
  };

  const handleDelete = (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    saveManagedProducts(next);
    if (editingId === id) resetForm();
    setStatus('Producto eliminado.');
  };

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Gestion de productos">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Gestionar Productos</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Agrega, edita o elimina productos. Tambien puedes abrir su vista publica.
          </p>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input className="bp-field" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="bp-field" placeholder="Tipo" value={type} onChange={(e) => setType(e.target.value)} required />
              <input
                className="bp-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
                  {editingId ? 'Guardar cambios' : 'Agregar producto'}
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
            <h2 className="bp-about-title">Productos ({items.length})</h2>
            <div className="manage-list">
              {items.map((item) => (
                <article className="manage-item" key={item.id}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="manage-item-image" />
                  ) : (
                    <div className="manage-item-image" aria-hidden="true" />
                  )}
                  <div className="manage-item-copy">
                    <strong>{item.name}</strong>
                    <p className="bp-meta">{item.type}</p>
                    <p className="bp-meta">Q{Number(item.price ?? 0).toFixed(2)}</p>
                    <p className="bp-meta">{item.description}</p>
                    <div className="manage-actions">
                      <Link to={`/tienda/producto/${item.id}`} className="bp-btn bp-btn-small">
                        Ver producto
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

export default DashboardProducts;
