import { apiClient } from './apiClient';

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  formData.append(key, value);
}

function buildBandFormData(payload) {
  const formData = new FormData();

  appendIfPresent(formData, 'Nombre', payload.nombre);
  appendIfPresent(formData, 'Descripcion', payload.descripcion);
  appendIfPresent(formData, 'Biografia', payload.biografia);
  appendIfPresent(formData, 'Genero', payload.genero);
  appendIfPresent(formData, 'UsuarioId', String(payload.usuarioId ?? ''));
  appendIfPresent(formData, 'Slug', payload.slug);

  if (payload.imagenFile) {
    formData.append('Imagen', payload.imagenFile);
  }

  if (payload.biografiaImagenFile) {
    formData.append('BiografiaImagen', payload.biografiaImagenFile);
  }

  return formData;
}

export const getBands = async () => {
  return apiClient('/api/Bandas');
};

export const getBandById = async (id) => {
  return apiClient(`/api/Bandas/${id}`);
};

export const updateBand = async (id, payload) => {
  return apiClient(`/api/Bandas/${id}`, {
    method: 'PUT',
    body: buildBandFormData(payload),
  });
};

export const getPublicBand = async (slug) => {
  return apiClient(`/api/Bandas/public/${slug}`);
};
