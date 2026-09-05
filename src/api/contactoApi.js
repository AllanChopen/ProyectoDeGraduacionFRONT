import { apiClient } from './apiClient';

export const getContactMessages = async () => {
  return apiClient('/api/Contacto');
};

export const getMyContactMessages = async () => {
  return apiClient('/api/Contacto/mis-mensajes');
};

export const createPublicContactMessage = async (slug, payload) => {
  return apiClient(`/api/Contacto/public/${slug}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};