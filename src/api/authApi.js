import { apiClient } from './apiClient';

export const login = async (email, password) => {
  return apiClient('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
};

export const requestPasswordReset = async (email) => {
  return apiClient('/api/Auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
};

export const resetPassword = async ({ email, code, newPassword, confirmPassword }) => {
  return apiClient('/api/Auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword, confirmPassword }),
    skipAuth: true,
  });
};
