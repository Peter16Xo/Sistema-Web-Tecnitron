/**
 * MODELO: Repuesto
 * Descripción: Estructura de datos para los repuestos físicos del inventario
 */
export interface Repuesto {
  id: string;
  nombre: string;
  descripcion: string;
  stock: number;
  precioUnitario: number;
  activo: boolean; // Para soft-delete (eliminar sin borrar de la base de datos)
}