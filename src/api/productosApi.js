import { apiClient } from './apiClient';

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  formData.append(key, value);
}

function buildProductFormData(payload) {
  const formData = new FormData();
  appendIfPresent(formData, 'Nombre', payload.nombre);
  appendIfPresent(formData, 'Descripcion', payload.descripcion);
  appendIfPresent(formData, 'Precio', String(payload.precio ?? 0));
  appendIfPresent(formData, 'Disponible', String(Boolean(payload.disponible)));
  appendIfPresent(formData, 'Stock', String(payload.stock ?? 0));
  appendIfPresent(formData, 'TieneTalla', String(Boolean(payload.tieneTalla)));

  if (payload.imagenFile) {
    formData.append('Imagen', payload.imagenFile);
  }

  return formData;
}

export const getPublicProducts = async (slug) => {
  return apiClient(`/api/Productos/public/${slug}`);
};

export const getPublicProductDetail = async (slug, id) => {
  return apiClient(`/api/Productos/public/${slug}/${id}`);
};

export const getDashboardProducts = async () => {
  return apiClient('/api/Productos');
};

export const createDashboardProduct = async (payload) => {
  return apiClient('/api/Productos', {
    method: 'POST',
    body: buildProductFormData(payload),
  });
};

export const updateDashboardProduct = async (id, payload) => {
  return apiClient(`/api/Productos/${id}`, {
    method: 'PUT',
    body: buildProductFormData(payload),
  });
};

export const deleteDashboardProduct = async (id) => {
  return apiClient(`/api/Productos/${id}`, {
    method: 'DELETE',
  });
};

export const getProductVariations = async (productId) => {
  return apiClient(`/api/Productos/${productId}/variaciones`);
};

export const createProductVariation = async (productId, payload) => {
  return apiClient(`/api/Productos/${productId}/variaciones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateProductVariation = async (productId, variationId, payload) => {
  return apiClient(`/api/Productos/${productId}/variaciones/${variationId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteProductVariation = async (productId, variationId) => {
  return apiClient(`/api/Productos/${productId}/variaciones/${variationId}`, {
    method: 'DELETE',
  });
};

export const mapProductVariant = (variant) => ({
  id: variant?.id ?? variant?.Id ?? variant?.ID ?? variant?.uuid ?? variant?.Uuid ?? variant?.UUID,
  uuid: variant?.uuid ?? variant?.Uuid ?? variant?.UUID,
  productId: variant?.productoId ?? variant?.ProductoId ?? variant?.ProductoID ?? null,
  label: variant?.nombre || variant?.Nombre || 'Variacion',
  name: variant?.nombre || variant?.Nombre || 'Variacion',
  stock: Number(variant?.stock ?? variant?.Stock ?? 0),
  available: Boolean(variant?.disponible ?? variant?.Disponible),
});

export const mapProductoToCard = (product, fallbackId = null) => {
  const source = product?.producto ?? product?.Producto ?? product;
  const idCandidates = [
    source?.id,
    source?.Id,
    source?.ID,
    source?.productoId,
    source?.ProductoId,
    source?.ProductoID,
    fallbackId,
  ];
  const rawId = idCandidates.find((value) => Number.isInteger(Number(value)) && Number(value) > 0);
  const numericId = Number(rawId);
  const variants = (source?.variaciones ?? source?.Variaciones ?? []).map(mapProductVariant);
  const hasSizes = Boolean(source?.tieneTalla ?? source?.TieneTalla);
  const totalStock = hasSizes
    ? variants.reduce((sum, variant) => sum + Number(variant.stock ?? 0), 0)
    : Number(source?.stock ?? source?.Stock ?? variants.reduce((sum, variant) => sum + Number(variant.stock ?? 0), 0));

  return {
    id: Number.isInteger(numericId) && numericId > 0 ? numericId : null,
    uuid: source?.uuid ?? source?.Uuid ?? source?.UUID,
    name: source?.nombre || source?.Nombre || 'Sin nombre',
    description: source?.descripcion || source?.Descripcion || '',
    price: Number(source?.precio ?? source?.Precio ?? 0),
    available: Boolean(source?.disponible ?? source?.Disponible),
    stock: totalStock,
    hasTalla: hasSizes,
    type: hasSizes ? 'Con tallas' : 'Stock general',
    image: source?.imagenUrl || source?.ImagenUrl || null,
    variants,
  };
};

export const mapProductoToDetail = (product, fallbackId = null) => {
  const mapped = mapProductoToCard(product, fallbackId);
  const singleVariantStock = Number(product?.stock ?? mapped.stock ?? 0);
  return {
    ...mapped,
    variants: mapped.variants.length
      ? mapped.variants
      : [
          {
            id: `product-${mapped.id ?? mapped.uuid ?? fallbackId}-default`,
            label: 'Presentacion unica',
            name: 'Presentacion unica',
            price: mapped.price,
            stock: mapped.hasTalla ? 0 : singleVariantStock,
            available: mapped.available,
            attributes: '',
          },
        ],
  };
};
