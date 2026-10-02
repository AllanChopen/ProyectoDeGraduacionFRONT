import { apiClient } from './apiClient';

export const login = async (email, password) => {
  return apiClient('/api/Auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
};
