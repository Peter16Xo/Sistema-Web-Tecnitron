import { ServicioManoObra } from '../modelos/servicio.modelo';

export const serviciosSimulados: ServicioManoObra[] = [
  { id: '1', nombre: 'Servicio General', descripcion: 'Mantenimiento preventivo y limpieza', precioBase: 50.00, activo: true },
  { id: '2', nombre: 'Mano de Obra Especializada', descripcion: 'Reparación de microcomponentes en placa', precioBase: 120.00, activo: true },
  { id: '3', nombre: 'Diagnóstico', descripcion: 'Revisión técnica inicial', precioBase: 30.00, activo: true }
];