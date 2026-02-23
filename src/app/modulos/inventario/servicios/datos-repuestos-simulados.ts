import { Repuesto } from '../modelos/repuesto.modelo';

export const repuestosSimulados: Repuesto[] = [
  { id: '1', nombre: 'Pantalla LCD Genérica', descripcion: 'Pantalla de repuesto 6.5 pulgadas', stock: 10, precioUnitario: 45.50, activo: true },
  { id: '2', nombre: 'Batería Li-Ion 4000mAh', descripcion: 'Batería estándar', stock: 5, precioUnitario: 25.00, activo: true },
  { id: '3', nombre: 'Pin de Carga Tipo C', descripcion: 'Conector de carga genérico', stock: 50, precioUnitario: 5.00, activo: true },
  { id: '4', nombre: 'Placa Base Antigua', descripcion: 'Placa descontinuada', stock: 0, precioUnitario: 15.00, activo: false } // Inactivo
];