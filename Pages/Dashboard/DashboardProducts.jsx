import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import LoadingState from '../../Components/LoadingState/LoadingState';
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

const SIZE_PRESETS = ['S', 'M', 'L', 'XL', 'XXL'];

function createDraftVariationRow(index = 0, overrides = {}) {
  return {
    tempId: overrides.tempId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    variationId: overrides.variationId ?? null,
    name: overrides.name ?? SIZE_PRESETS[index] ?? `Talla ${index + 1}`,
    stock: overrides.stock ?? '',
    available: overrides.available ?? true,
  };
}

function mapDraftVariationFromApi(variation, index) {
  return createDraftVariationRow(index, {
    tempId: variation?.id ?? variation?.uuid ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    variationId: variation?.id ?? variation?.uuid ?? null,
    name: variation?.name ?? variation?.nombre ?? SIZE_PRESETS[index] ?? `Talla ${index + 1}`,
    stock: String(variation?.stock ?? 0),
    available: variation?.available !== false && variation?.disponible !== false,
  });
}

function DashboardProducts() {
  const { slug = '' } = useParams();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [stock, setStock] = useState('');
  const [hasTalla, setHasTalla] = useState(false);
  const [draftVariations, setDraftVariations] = useState([]);
  const [variationItems, setVariationItems] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      return [];
    }

    try {
      const data = await getProductVariations(productId);
      const mapped = data.map(mapProductVariant);
      setVariationItems(mapped);
      return mapped;
    } catch (error) {
      setStatus(error.message || 'No se pudieron cargar las variaciones.');
      return [];
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImageFile(null);
    setAvailable(true);
    setStock('');
    setHasTalla(false);
    setDraftVariations([]);
    setSelectedProductId(null);
    setVariationItems([]);
  };

  const addDraftVariationRow = () => {
    setDraftVariations((current) => [...current, createDraftVariationRow(current.length)]);
  };

  const updateDraftVariationRow = (tempId, field, value) => {
    setDraftVariations((current) =>
      current.map((row) => (row.tempId === tempId ? { ...row, [field]: value } : row))
    );
  };

  const removeDraftVariationRow = (tempId) => {
    setDraftVariations((current) => {
      const next = current.filter((row) => row.tempId !== tempId);
      return next.length > 0 ? next : [createDraftVariationRow(0)];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus('');

    const productHasTalla = hasTalla;
    const payload = {
      nombre: name,
      descripcion: description,
      precio: Number(price) || 0,
      disponible: available,
      stock: productHasTalla ? 0 : Number(stock) || 0,
      tieneTalla: productHasTalla,
      imagenFile: imageFile || undefined,
    };

    try {
      const savedProduct = editingId
        ? await updateDashboardProduct(editingId, payload)
        : await createDashboardProduct(payload);

      if (savedProduct?.id && productHasTalla) {
        const rows = draftVariations.length > 0 ? draftVariations : [createDraftVariationRow(0)];
        const currentVariationIds = new Set((editingId ? variationItems : []).map((variation) => variation.id));
        const submittedVariationIds = new Set();

        for (const row of rows) {
          const variationPayload = {
            nombre: row.name.trim(),
            stock: Number(row.stock) || 0,
            disponible: row.available !== false,
          };

          if (row.variationId) {
            await updateProductVariation(savedProduct.id, row.variationId, variationPayload);
            submittedVariationIds.add(row.variationId);
          } else {
            const createdVariation = await createProductVariation(savedProduct.id, variationPayload);
            if (createdVariation?.id) {
              submittedVariationIds.add(createdVariation.id);
            }
          }
        }

        const variationsToDelete = [...currentVariationIds].filter((variationId) => !submittedVariationIds.has(variationId));
        if (variationsToDelete.length > 0) {
          await Promise.all(variationsToDelete.map((variationId) => deleteProductVariation(savedProduct.id, variationId)));
        }
      }

      if (editingId && savedProduct?.id && !productHasTalla && variationItems.length > 0) {
        await Promise.all(variationItems.map((variation) => deleteProductVariation(savedProduct.id, variation.id)));
      }

      await loadItems();
      setStatus(editingId ? 'Producto actualizado.' : 'Producto agregado.');
      resetForm();

      if (savedProduct?.id && productHasTalla) {
        const refreshedVariations = await loadVariations(savedProduct.id);
        setDraftVariations(
          refreshedVariations.length > 0
            ? refreshedVariations.map((variation, index) => mapDraftVariationFromApi(variation, index))
            : [createDraftVariationRow(0)]
        );
      }
    } catch (error) {
      setStatus(error.message || 'No se pudo guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = async (item) => {
    setEditingId(item.id);
    setSelectedProductId(item.id);
    setName(item.name ?? '');
    setPrice(String(item.price ?? 0));
    setDescription(item.description ?? '');
    setImageFile(null);
    setAvailable(item.available !== false);
    setStock(String(item.stock ?? 0));
    setHasTalla(Boolean(item.hasTalla));

    if (item.hasTalla) {
      const loadedVariations = await loadVariations(item.id);
      setDraftVariations(
        loadedVariations.length > 0
          ? loadedVariations.map((variation, index) => mapDraftVariationFromApi(variation, index))
          : [createDraftVariationRow(0)]
      );
    } else {
      setDraftVariations([]);
      setVariationItems([]);
    }

    setStatus('Editando producto.');
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
      }
      setStatus('Producto eliminado.');
    } catch (error) {
      setStatus(error.message || 'No se pudo eliminar el producto.');
    }
  };

  if (isLoading) {
    return (
      <main className="bp-page manage-page">
        <NavBar />
        <LoadingState label="Cargando productos..." />
        <Footer />
      </main>
    );
  }

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
          <div className="manage-top-actions">
            <Link to={`/${slug}/dashboard`} className="bp-btn bp-btn-small bp-btn-ghost">
              Volver al dashboard
            </Link>
          </div>
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
                <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />{' '}
                Disponible
              </label>
              <input className="bp-field" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <input
                className="bp-field"
                type="number"
                min="0"
                step="1"
                placeholder={hasTalla ? 'Stock general deshabilitado' : 'Stock general'}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={hasTalla}
                required={!hasTalla}
              />
              <label className="bp-meta">
                <input
                  type="checkbox"
                  checked={hasTalla}
                  onChange={(e) => {
                    const nextHasTalla = e.target.checked;
                    setHasTalla(nextHasTalla);
                    if (nextHasTalla) {
                      setStock('');
                      setDraftVariations((current) =>
                        current.length > 0 ? current : [createDraftVariationRow(0)]
                      );
                    } else {
                      setDraftVariations([]);
                    }
                  }}
                />{' '}
                Tiene talla
              </label>

              {hasTalla ? (
                <div className="manage-variant-box">
                  <div className="manage-variant-builder-head">
                    <h3 className="bp-about-title">Tallas</h3>
                    <p className="bp-meta">El stock general queda deshabilitado. Cada talla usa su propio stock.</p>
                  </div>

                  <div className="manage-variant-list">
                    {draftVariations.map((variation) => (
                      <div className="manage-variant-row" key={variation.tempId}>
                        <div className="manage-variant-top">
                          <input
                            className="bp-field"
                            placeholder="Talla"
                            value={variation.name}
                            onChange={(e) => updateDraftVariationRow(variation.tempId, 'name', e.target.value)}
                            required
                          />
                          <input
                            className="bp-field"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Stock"
                            value={variation.stock}
                            onChange={(e) => updateDraftVariationRow(variation.tempId, 'stock', e.target.value)}
                            required
                          />
                        </div>
                        <div className="manage-variant-bottom">
                          <label className="bp-meta manage-variant-switch">
                            <input
                              type="checkbox"
                              checked={variation.available}
                              onChange={(e) => updateDraftVariationRow(variation.tempId, 'available', e.target.checked)}
                            />{' '}
                            Disponible
                          </label>
                          <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={() => removeDraftVariationRow(variation.tempId)}>
                            Quitar talla
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="manage-actions">
                    <button type="button" className="bp-btn bp-btn-small bp-btn-ghost" onClick={addDraftVariationRow}>
                      Agregar talla
                    </button>
                  </div>
                </div>
              ) : (
                <p className="bp-meta">El producto se guardará con stock general y sin variaciones.</p>
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
            <div className="manage-list">
              {items.map((item) => (
                <article className="manage-item" key={item.id}>
                  {item.image ? <img src={item.image} alt={item.name} className="manage-item-image" /> : <div className="manage-item-image" aria-hidden="true" />}
                  <div className="manage-item-copy">
                    <strong>{item.name}</strong>
                    <p className="bp-meta">{item.available ? 'Disponible' : 'No disponible'}</p>
                    <p className="bp-meta">Q{Number(item.price ?? 0).toFixed(2)}</p>
                    <p className="bp-meta">Stock: {Number(item.stock ?? 0)}</p>
                    <p className="bp-meta">{item.hasTalla ? 'Con tallas' : 'Stock general'}</p>
                    <p className="bp-meta">Variaciones: {item.variants?.length ?? 0}</p>
                    <p className="bp-meta">{item.description}</p>
                    <div className="manage-actions">
                      <Link to={`/${slug}/store/product/${item.id ?? item.uuid}`} className="bp-btn bp-btn-small">
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
