import { apiClient } from './apiClient';

export const login = async (email, password) => {
  return apiClient('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};
