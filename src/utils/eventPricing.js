export function calcularPrecioEvento(precioEntrada, cantidad) {
  const subtotal = Number(precioEntrada || 0) * Number(cantidad || 0);
  const tarifaServicio = Math.max(subtotal * 0.10, 5);

  return { subtotal, tarifaServicio, total: subtotal + tarifaServicio };
}
