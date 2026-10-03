const API_URL = import.meta.env.VITE_API_URL;

const FIELD_LABELS = {
  email: 'El correo electronico',
  code: 'El codigo',
  newpassword: 'La contrasena nueva',
  confirmpassword: 'La confirmacion de contrasena',
  password: 'La contrasena',
};

function humanizeValidationError(field, message) {
  const label = FIELD_LABELS[String(field).toLowerCase()] || `El campo ${field}`;
  const minLength = message.match(/minimum length of ['"]?(\d+)/i);
  const maxLength = message.match(/maximum length of ['"]?(\d+)/i);

  if (minLength) return `${label} debe tener al menos ${minLength[1]} caracteres.`;
  if (maxLength) return `${label} debe tener como maximo ${maxLength[1]} caracteres.`;
  if (/required/i.test(message)) return `${label} es obligatorio.`;
  if (/valid email|email address/i.test(message)) return 'Ingresa un correo electronico valido.';
  if (/string or array type/i.test(message)) return `${label} tiene un formato invalido.`;
  return `${label}: ${message}`;
}

function normalizeApiError(errorBody, status) {
  if (errorBody?.errors && typeof errorBody.errors === 'object') {
    const messages = Object.entries(errorBody.errors).flatMap(([field, fieldErrors]) =>
      (Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors])
        .filter((message) => typeof message === 'string' && message.trim())
        .map((message) => humanizeValidationError(field, message))
    );
    return messages.length ? [...new Set(messages)].join(' ') : 'Revisa los datos ingresados.';
  }

  const message = errorBody?.message || errorBody?.title;
  if (message && !/one or more validation errors occurred/i.test(message)) return message;
  return `No se pudo completar la solicitud (${status}).`;
}
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
        message = normalizeApiError(errorBody, response.status);
      } else {
        const errorText = await response.text();
        message = errorText || `No se pudo completar la solicitud (${response.status}).`;
      }
    } catch {
      // response had no JSON body
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
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
