import { apiClient } from './apiClient';

export const getPublicBand = async (slug) => {
  return apiClient(`/api/Bandas/public/${slug}`);
};

export const getPublicPosts = async (slug) => {
  return apiClient(`/api/Publicaciones/public/${slug}`);
};

export const getPublicPostDetail = async (slug, id) => {
  return apiClient(`/api/Publicaciones/public/${slug}/${id}`);
};

export const getPublicEvents = async (slug) => {
  return apiClient(`/api/Eventos/public/${slug}`);
};

export const getPublicEventDetail = async (slug, id) => {
  return apiClient(`/api/Eventos/public/${slug}/${id}`);
};

export const getPublicProducts = async (slug) => {
  return apiClient(`/api/Productos/public/${slug}`);
};

export const getPublicProductDetail = async (slug, id) => {
  return apiClient(`/api/Productos/public/${slug}/${id}`);
};
