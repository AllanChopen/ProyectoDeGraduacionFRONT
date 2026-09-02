const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_STORAGE_KEY = 'lito_auth_token';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.message || errorBody.title || message;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
