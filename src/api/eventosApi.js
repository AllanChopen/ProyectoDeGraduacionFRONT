import { apiClient } from './apiClient';

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  formData.append(key, value);
}

function buildEventBody(payload) {
  const formData = new FormData();
  appendIfPresent(formData, 'BandaId', String(payload.bandaId));
  appendIfPresent(formData, 'Nombre', payload.nombre);
  appendIfPresent(formData, 'Descripcion', payload.descripcion);
  appendIfPresent(formData, 'Fecha', payload.fecha);
  appendIfPresent(formData, 'Hora', payload.hora);
  appendIfPresent(formData, 'Ubicacion', payload.ubicacion);
  appendIfPresent(formData, 'UbicacionUrl', payload.ubicacionUrl);
  appendIfPresent(formData, 'Capacidad', String(payload.capacidad ?? 0));
  appendIfPresent(formData, 'PrecioEntrada', String(payload.precioEntrada ?? 0));
  appendIfPresent(formData, 'Estado', payload.estado);

  if (payload.imagenFile) {
    formData.append('Imagen', payload.imagenFile);
  }

  return formData;
}

function formatEventDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-ES');
}

function formatEventTime(value) {
  if (!value) {
    return 'Sin hora';
  }

  const match = String(value).match(/^(\d{2}:\d{2})/);
  if (match) {
    return match[1];
  }

  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getEventTimestamp(event) {
  if (!event?.fecha) {
    return Number.POSITIVE_INFINITY;
  }

  const timeValue = event?.hora ? String(event.hora).slice(0, 8) : '00:00:00';
  const timestamp = new Date(`${event.fecha.slice(0, 10)}T${timeValue}`).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export const sortEventosForDisplay = (events) => {
  const now = Date.now();

  return [...events].sort((left, right) => {
    const leftTime = getEventTimestamp(left);
    const rightTime = getEventTimestamp(right);
    const leftIsPast = leftTime < now;
    const rightIsPast = rightTime < now;

    if (leftIsPast !== rightIsPast) {
      return leftIsPast ? 1 : -1;
    }

    return leftTime - rightTime;
  });
};

export const getPublicEvents = async (slug) => {
  return apiClient(`/api/Eventos/public/${slug}`);
};

export const getPublicEventDetail = async (slug, id) => {
  return apiClient(`/api/Eventos/public/${slug}/${id}`);
};

export const getDashboardEvents = async () => {
  return apiClient('/api/Eventos');
};

export const createDashboardEvent = async (payload) => {
  return apiClient('/api/Eventos', {
    method: 'POST',
    body: buildEventBody(payload),
  });
};

export const updateDashboardEvent = async (id, payload) => {
  return apiClient(`/api/Eventos/${id}`, {
    method: 'PUT',
    body: buildEventBody(payload),
  });
};

export const deleteDashboardEvent = async (id) => {
  return apiClient(`/api/Eventos/${id}`, {
    method: 'DELETE',
  });
};

export const mapEventoToCard = (event) => ({
  id: event?.id ?? event?.uuid,
  title: event?.nombre || 'Sin titulo',
  description: event?.descripcion || '',
  date: formatEventDate(event?.fecha),
  time: formatEventTime(event?.hora),
  venue: event?.ubicacion || 'Sin ubicacion',
  location: event?.ubicacion || 'Sin ubicacion',
  capacity: Number(event?.capacidad ?? 0),
  availableTickets: Number(event?.entradasDisponibles ?? 0),
  price: Number(event?.precioEntrada ?? 0),
  status: event?.estado || 'Sin estado',
  poster: event?.imagenUrl || null,
  mapsUrl: event?.ubicacionUrl || '',
});

export const mapEventoToDetail = (event, fallbackId = null) => ({
  id: event?.id ?? event?.uuid ?? fallbackId,
  title: event?.nombre || 'Sin titulo',
  description: event?.descripcion || '',
  date: formatEventDate(event?.fecha),
  time: formatEventTime(event?.hora),
  venue: event?.ubicacion || 'Sin ubicacion',
  location: event?.ubicacion || 'Sin ubicacion',
  capacity: Number(event?.capacidad ?? 0),
  availableTickets: Number(event?.entradasDisponibles ?? 0),
  price: Number(event?.precioEntrada ?? 0),
  status: event?.estado || 'Sin estado',
  poster: event?.imagenUrl || null,
  mapsUrl: event?.ubicacionUrl || '',
  ticketTypes: [
    {
      id: `show-${event?.id ?? event?.uuid ?? fallbackId}-general`,
      label: 'General',
      price: Number(event?.precioEntrada ?? 0),
      stock: Number(event?.entradasDisponibles ?? 0),
    },
  ],
});
