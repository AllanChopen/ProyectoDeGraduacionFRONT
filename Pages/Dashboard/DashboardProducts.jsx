import { useEffect, useState } from 'react';
import Footer from '../../Components/Footer/Footer';
import NavBar from '../../Components/NavBar/NavBar';
import {
  createDashboardProduct,
  createProductVariation,
  deleteDashboardProduct,
  deleteProductVariation,
  getDashboardProducts,
  getProductVariations,
  mapProductVariant,
  mapProductoToCard,
  updateDashboardProduct,
  updateProductVariation
} from '../../src/api/productosApi';
import '../BandPublic/BandPublic.css';
import './ManageContent.css';

function DashboardProducts() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [draftVariations, setDraftVariations] = useState([]);
  const [draftVariationName, setDraftVariationName] = useState('');
  const [draftVariationAttributes, setDraftVariationAttributes] = useState('');
  const [draftVariationPrice, setDraftVariationPrice] = useState('');
  const [draftVariationStock, setDraftVariationStock] = useState('');
  const [draftVariationAvailable, setDraftVariationAvailable] = useState(true);
  const [variationItems, setVariationItems] = useState([]);
  const [editingVariationId, setEditingVariationId] = useState(null);
  const [variationName, setVariationName] = useState('');
  const [variationAttributes, setVariationAttributes] = useState('');
  const [variationPrice, setVariationPrice] = useState('');
  const [variationStock, setVariationStock] = useState('');
  const [variationAvailable, setVariationAvailable] = useState(true);
  const [status, setStatus] = useState('');
  const [variationStatus, setVariationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [isSubmittingVariation, setIsSubmittingVariation] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardProducts();
      const mapped = data.map((item) => mapProductoToCard(item, item.id));
      setItems(mapped);
      setStatus('');
    } catch (error) {
      setStatus(error.message || 'No se pudieron cargar los productos.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVariations = async (productId) => {
    if (!productId) {
      setVariationItems([]);
      return;
    }

    setIsLoadingVariations(true);
    try {
      const data = await getProductVariations(productId);
      setVariationItems(data.map(mapProductVariant));
      setVariationStatus('');
    } catch (error) {
      setVariationStatus(error.message || 'No se pudieron cargar las variaciones.');
    } finally {
      setIsLoadingVariations(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImageFile(null);
    setAvailable(true);
    resetDraftVariationForm();
    setDraftVariations([]);
  };

  const resetDraftVariationForm = () => {
    setDraftVariationName('');
    setDraftVariationAttributes('');
    setDraftVariationPrice('');
    setDraftVariationStock('');
    setDraftVariationAvailable(true);
  };

  const resetVariationForm = () => {
    setEditingVariationId(null);
    setVariationName('');
    setVariationAttributes('');
    setVariationPrice('');
    setVariationStock('');
    setVariationAvailable(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus('');

    const payload = {
      nombre: name,
      descripcion: description,
      precio: Number(price) || 0,
      disponible: available,
      imagenFile: imageFile || undefined,
    };

    try {
      const savedProduct = editingId
        ? await updateDashboardProduct(editingId, payload)
        : await createDashboardProduct(payload);

      if (!editingId && savedProduct?.id && draftVariations.length > 0) {
        await Promise.all(
          draftVariations.map((variation) =>
            createProductVariation(savedProduct.id, {
              nombre: variation.name,
              precio: variation.price,
              stock: variation.stock,
              disponible: variation.available,
              atributos: variation.attributes,
            })
          )
        );
      }

      await loadItems();
      setStatus(editingId ? 'Producto actualizado.' : 'Producto agregado.');
      resetForm();

      if (savedProduct?.id) {
        setSelectedProductId(savedProduct.id);
        await loadVariations(savedProduct.id);
      }
    } catch (error) {
      setStatus(error.message || 'No se pudo guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name ?? '');
    setPrice(String(item.price ?? 0));
    setDescription(item.description ?? '');
    setImageFile(null);
    setAvailable(item.available !== false);
    setDraftVariations([]);
    resetDraftVariationForm();
    setStatus('Editando producto.');
  };

  const handleDraftVariationAdd = () => {
    if (!draftVariationName.trim()) {
      setStatus('Agrega un nombre para la variacion inicial.');
      return;
    }

    const nextVariation = {
      id: Date.now(),
      name: draftVariationName.trim(),
      attributes: draftVariationAttributes.trim(),
      price: Number(draftVariationPrice) || 0,
      stock: Number(draftVariationStock) || 0,
      available: draftVariationAvailable,
    };

    setDraftVariations((current) => [...current, nextVariation]);
    setStatus('');
    resetDraftVariationForm();
  };

  const handleDraftVariationRemove = (variationId) => {
    setDraftVariations((current) => current.filter((variation) => variation.id !== variationId));
  };

  const openVariations = async (productId) => {
    setSelectedProductId(productId);
    resetVariationForm();
    await loadVariations(productId);
  };

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm('Estas seguro de eliminar este producto?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDashboardProduct(id);
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      if (editingId === id) resetForm();
      if (selectedProductId === id) {
        setSelectedProductId(null);
        setVariationItems([]);
        resetVariationForm();
      }
      setStatus('Producto eliminado.');
    } catch (error) {
      setStatus(error.message || 'No se pudo eliminar el producto.');
    }
  };

  const startVariationEdit = (variation) => {
    setEditingVariationId(variation.id);
    setVariationName(variation.name ?? '');
    setVariationAttributes(variation.attributes ?? '');
    setVariationPrice(String(variation.price ?? 0));
    setVariationStock(String(variation.stock ?? 0));
    setVariationAvailable(variation.available !== false);
    setVariationStatus('Editando variacion.');
  };

  const handleVariationSubmit = async (event) => {
    event.preventDefault();
    if (!selectedProductId) {
      setVariationStatus('Selecciona un producto antes de gestionar variaciones.');
      return;
    }

    setIsSubmittingVariation(true);
    setVariationStatus('');

    const payload = {
      nombre: variationName,
      precio: Number(variationPrice) || 0,
      stock: Number(variationStock) || 0,
      disponible: variationAvailable,
      atributos: variationAttributes,
    };

    try {
      if (editingVariationId) {
        await updateProductVariation(selectedProductId, editingVariationId, payload);
        setVariationStatus('Variacion actualizada.');
      } else {
        await createProductVariation(selectedProductId, payload);
        setVariationStatus('Variacion agregada.');
      }

      await loadVariations(selectedProductId);
      await loadItems();
      resetVariationForm();
    } catch (error) {
      setVariationStatus(error.message || 'No se pudo guardar la variacion.');
    } finally {
      setIsSubmittingVariation(false);
    }
  };

  const handleVariationDelete = async (variationId) => {
    if (!selectedProductId) {
      return;
    }

    const shouldDelete = window.confirm('Estas seguro de eliminar esta variacion?');
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProductVariation(selectedProductId, variationId);
      await loadVariations(selectedProductId);
      await loadItems();
      if (editingVariationId === variationId) {
        resetVariationForm();
      }
      setVariationStatus('Variacion eliminada.');
    } catch (error) {
      setVariationStatus(error.message || 'No se pudo eliminar la variacion.');
    }
  };

  const selectedProduct = items.find((item) => item.id === selectedProductId) ?? null;

  return (
    <main className="bp-page manage-page">
      <NavBar />

      <section className="bp-section" aria-label="Gestion de productos">
        <div className="bp-section-header">
          <h1 className="bp-section-title">Gestionar Productos</h1>
          <div className="bp-divider" />
          <p className="manage-subtitle">
            Administra productos e inventario por variaciones desde los endpoints reales del catalogo.
          </p>
        </div>

        <div className="bp-container manage-layout">
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form className="manage-form" onSubmit={handleSubmit}>
              <input className="bp-field" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
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
              />
              <label className="bp-meta">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                />{' '}
                Disponible
              </label>
              <input
                className="bp-field"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />

              {!editingId ? (
                <div className="bp-contact-panel">
                  <h3 className="bp-about-title">Variaciones iniciales</h3>
                  <div className="manage-form">
                    <input
                      className="bp-field"
                      placeholder="Nombre de la variacion"
                      value={draftVariationName}
                      onChange={(e) => setDraftVariationName(e.target.value)}
                    />
                    <input
                      className="bp-field"
                      placeholder="Atributos"
                      value={draftVariationAttributes}
                      onChange={(e) => setDraftVariationAttributes(e.target.value)}
                    />
                    <input
                      className="bp-field"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Precio de variacion"
                      value={draftVariationPrice}
                      onChange={(e) => setDraftVariationPrice(e.target.value)}
                    />
                    <input
                      className="bp-field"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Stock de variacion"
                      value={draftVariationStock}
                      onChange={(e) => setDraftVariationStock(e.target.value)}
                    />
                    <label className="bp-meta">
                      <input
                        type="checkbox"
                        checked={draftVariationAvailable}
                        onChange={(e) => setDraftVariationAvailable(e.target.checked)}
                      />{' '}
                      Variacion disponible
                    </label>
                    <div className="manage-actions">
                      <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={handleDraftVariationAdd}>
                        Agregar variacion inicial
                      </button>
                    </div>
                  </div>

                  {draftVariations.length > 0 ? (
                    <div className="manage-list">
                      {draftVariations.map((variation) => (
                        <article className="manage-item" key={variation.id}>
                          <div className="manage-item-image" aria-hidden="true" />
                          <div className="manage-item-copy">
                            <strong>{variation.name}</strong>
                            <p className="bp-meta">{variation.attributes || 'Sin atributos'}</p>
                            <p className="bp-meta">Q{variation.price.toFixed(2)}</p>
                            <p className="bp-meta">Stock: {variation.stock}</p>
                            <p className="bp-meta">{variation.available ? 'Disponible' : 'No disponible'}</p>
                            <div className="manage-actions">
                              <button
                                type="button"
                                className="bp-btn bp-btn-small bp-btn-ghost"
                                onClick={() => handleDraftVariationRemove(variation.id)}
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="bp-meta">Puedes crear el producto con sus variaciones y stock desde este mismo formulario.</p>
                  )}
                </div>
              ) : (
                <p className="bp-meta">Las variaciones existentes se administran en el panel inferior del producto seleccionado.</p>
              )}

              <div className="manage-actions">
                <button type="submit" className="bp-btn bp-btn-small" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar producto'}
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
            {isLoading ? <p className="bp-meta">Cargando productos...</p> : null}
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
                    <p className="bp-meta">{item.available ? 'Disponible' : 'No disponible'}</p>
                    <p className="bp-meta">Q{Number(item.price ?? 0).toFixed(2)}</p>
                    <p className="bp-meta">Variaciones: {item.variants?.length ?? 0}</p>
                    <p className="bp-meta">{item.description}</p>
                    <div className="manage-actions">
                      <button type="button" className="bp-btn bp-btn-small" onClick={() => openVariations(item.id)}>
                        Variaciones
                      </button>
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

        <div className="bp-container" style={{ marginTop: '1rem' }}>
          <article className="bp-contact-panel">
            <h2 className="bp-about-title">
              {selectedProduct ? `Variaciones de ${selectedProduct.name}` : 'Variaciones'}
            </h2>

            {!selectedProduct ? (
              <p className="bp-meta">Selecciona un producto para administrar sus variaciones.</p>
            ) : (
              <>
                <form className="manage-form" onSubmit={handleVariationSubmit}>
                  <input
                    className="bp-field"
                    placeholder="Nombre de la variacion"
                    value={variationName}
                    onChange={(e) => setVariationName(e.target.value)}
                    required
                  />
                  <input
                    className="bp-field"
                    placeholder="Atributos"
                    value={variationAttributes}
                    onChange={(e) => setVariationAttributes(e.target.value)}
                  />
                  <input
                    className="bp-field"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Precio"
                    value={variationPrice}
                    onChange={(e) => setVariationPrice(e.target.value)}
                    required
                  />
                  <input
                    className="bp-field"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Stock"
                    value={variationStock}
                    onChange={(e) => setVariationStock(e.target.value)}
                    required
                  />
                  <label className="bp-meta">
                    <input
                      type="checkbox"
                      checked={variationAvailable}
                      onChange={(e) => setVariationAvailable(e.target.checked)}
                    />{' '}
                    Disponible
                  </label>
                  <div className="manage-actions">
                    <button type="submit" className="bp-btn bp-btn-small" disabled={isSubmittingVariation}>
                      {isSubmittingVariation
                        ? 'Guardando...'
                        : editingVariationId
                          ? 'Guardar variacion'
                          : 'Agregar variacion'}
                    </button>
                    {editingVariationId ? (
                      <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={resetVariationForm}>
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>

                <p className="manage-status">{variationStatus}</p>
                {isLoadingVariations ? <p className="bp-meta">Cargando variaciones...</p> : null}

                <div className="manage-list">
                  {variationItems.map((variation) => (
                    <article className="manage-item" key={variation.id}>
                      <div className="manage-item-image" aria-hidden="true" />
                      <div className="manage-item-copy">
                        <strong>{variation.name}</strong>
                        <p className="bp-meta">{variation.attributes || 'Sin atributos'}</p>
                        <p className="bp-meta">Q{variation.price.toFixed(2)}</p>
                        <p className="bp-meta">Stock: {variation.stock}</p>
                        <p className="bp-meta">{variation.available ? 'Disponible' : 'No disponible'}</p>
                        <div className="manage-actions">
                          <button
                            type="button"
                            className="bp-btn bp-btn-small bp-btn-ghost"
                            onClick={() => startVariationEdit(variation)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="bp-btn bp-btn-small bp-btn-ghost"
                            onClick={() => handleVariationDelete(variation.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default DashboardProducts;
