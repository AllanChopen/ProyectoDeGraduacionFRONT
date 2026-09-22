export function calcularPrecioProductos(subtotal, costoEnvio = 0) {
  const safeSubtotal = Number(subtotal || 0);
  const safeShipping = Number(costoEnvio || 0);
  const tarifaServicio = Math.max(safeSubtotal * 0.10, 5);

  return {
    subtotal: safeSubtotal,
    tarifaServicio,
    costoEnvio: safeShipping,
    total: safeSubtotal + tarifaServicio + safeShipping,
  };
}
