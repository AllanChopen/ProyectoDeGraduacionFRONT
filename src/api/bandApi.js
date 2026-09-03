import { apiClient } from './apiClient';

export const getPublicBand = async (slug) => {
  return apiClient(`/api/Bandas/public/${slug}`);
};
