import { apiClient } from './apiClient';

export const getPublicSocialLinks = async (slug) => {
  return apiClient(`/api/RedSocial/public/${slug}`, { skipAuth: true });
};

export const getDashboardSocialLinks = async () => {
  return apiClient('/api/RedSocial');
};

export const createDashboardSocialLink = async (payload) => {
  return apiClient('/api/RedSocial', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateDashboardSocialLink = async (id, payload) => {
  return apiClient(`/api/RedSocial/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteDashboardSocialLink = async (id) => {
  return apiClient(`/api/RedSocial/${id}`, {
    method: 'DELETE',
  });
};
