import { apiClient } from './apiClient';

export const getPublicPosts = async (slug) => {
  return apiClient(`/api/Publicaciones/public/${slug}`);
};

export const getPublicPostDetail = async (slug, id) => {
  return apiClient(`/api/Publicaciones/public/${slug}/${id}`);
};

export const getDashboardPosts = async () => {
  return apiClient('/api/Publicaciones');
};

export const deleteDashboardPost = async (id) => {
  return apiClient(`/api/Publicaciones/${id}`, { method: 'DELETE' });
};

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  formData.append(key, value);
}

function buildPostFormData(payload) {
  const formData = new FormData();
  appendIfPresent(formData, 'Titulo', payload.titulo);
  appendIfPresent(formData, 'Contenido', payload.contenido);
  appendIfPresent(formData, 'FechaPublicacion', payload.fechaPublicacion);
  appendIfPresent(formData, 'Estado', payload.estado);

  if (payload.imagenFile) {
    formData.append('Imagen', payload.imagenFile);
  }

  return formData;
}

export const createDashboardPost = async (payload) => {
  const body = buildPostFormData(payload);
  return apiClient('/api/Publicaciones', {
    method: 'POST',
    body,
  });
};

export const updateDashboardPost = async (id, payload) => {
  const body = buildPostFormData(payload);
  return apiClient(`/api/Publicaciones/${id}`, {
    method: 'PUT',
    body,
  });
};

export const mapPublicacionToCard = (post) => {
  const safeContent = post?.contenido || '';
  const excerpt =
    safeContent.length > 150 ? `${safeContent.substring(0, 150)}...` : safeContent;

  return {
    id: post?.id ?? post?.uuid,
    title: post?.titulo || 'Sin titulo',
    excerpt,
    image: post?.imagenUrl || null,
    date: post?.fechaPublicacion
      ? new Date(post.fechaPublicacion).toLocaleDateString('es-ES')
      : 'Sin fecha',
  };
};

export const mapPublicacionToDetail = (post, fallbackId = null) => ({
  id: post?.id ?? post?.uuid ?? fallbackId,
  title: post?.titulo || 'Sin titulo',
  content: (post?.contenido || '').split(/\r?\n\r?\n/).filter(Boolean),
  image: post?.imagenUrl || null,
  date: post?.fechaPublicacion
    ? new Date(post.fechaPublicacion).toLocaleDateString('es-ES')
    : 'Sin fecha',
});
