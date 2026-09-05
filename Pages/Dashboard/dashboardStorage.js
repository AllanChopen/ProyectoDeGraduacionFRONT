export function formatDate(isoString) {
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('es-GT');
}
