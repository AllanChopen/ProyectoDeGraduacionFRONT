const API_URL = import.meta.env.VITE_API_URL;
import { getTokenForActiveSlug } from '../utils/authSessionStorage';

export const apiClient = async (endpoint, options = {}) => {
  const { skipAuth = false, ...requestOptions } = options;
  const token = getTokenForActiveSlug();
  const isFormDataBody = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...requestOptions.headers,
    },
  });

  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorBody = await response.json();
        message = errorBody.message || errorBody.title || message;
      } else {
        const errorText = await response.text();
        message = errorText || message;
      }
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};
