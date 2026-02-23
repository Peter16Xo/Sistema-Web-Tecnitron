/**
 * MODELO: Servicio de Mano de Obra
 * Descripción: Estructura de datos para los servicios que realizan los técnicos
 */
export interface ServicioManoObra {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  activo: boolean; // Para soft-delete
}