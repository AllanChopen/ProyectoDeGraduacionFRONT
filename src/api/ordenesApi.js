import { apiClient } from './apiClient';

export const getMyOrdersSummary = async () => {
  return apiClient('/api/Ordenes/mis-ordenes/estado-resumen');
};

export const getMyOrders = async () => {
  return apiClient('/api/Ordenes/mis-ordenes');
};

export const getMyOrderById = async (id) => {
  return apiClient(`/api/Ordenes/mis-ordenes/${id}`);
};

export const markMyOrderAsSent = async (id) => {
  return apiClient(`/api/Ordenes/mis-ordenes/${id}/enviar`, {
    method: 'POST',
  });
};
