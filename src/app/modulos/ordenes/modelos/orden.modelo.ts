/**
 * MODELO: Orden de Trabajo
 * Descripción: Estructuras de datos para la gestión de reparaciones.
 * Fecha: 2026
 */

export type EstadoOrden = 'Recibido' | 'Diagnóstico' | 'En Reparación' | 'Listo' | 'Entregado' | 'Cancelado';

export interface Equipo {
  tipo: string;       // Ej. Celular, Laptop, Consola
  marca: string;      // Ej. Samsung, Dell
  modelo: string;     // Ej. Galaxy S21
  serie: string;      // Número de serie único
}

export interface DiagnosticoTecnico {
  fallaReportada: string;       // Lo que dice el cliente (Ingresado por Recepcionista)
  accesoriosRecibidos: string;  // Ej. Cargador, funda (Ingresado por Recepcionista)
  informeTecnico?: string;      // La revisión real (Ingresado por Técnico)
  presupuestoEstimado?: number; // Costo estimado de la reparación
}

export interface ItemOrden {
  tipo: 'repuesto' | 'servicio';
  itemId: string;         // ID del repuesto o del servicio
  nombre: string;         // Nombre para historial
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenTrabajo {
  id: string;
  codigo: string;         // Ej. ORD-0001 (Para que el cliente lo rastree)
  clienteId: string;      // Relación con el cliente
  
  // Relaciones opcionales (se llenan al consultar la orden completa)
  clienteNombre?: string; 
  clienteCedula?: string;
  
  tecnicoId?: string;     // ID del técnico asignado (opcional al inicio)
  tecnicoNombre?: string;
  
  equipo: Equipo;
  diagnostico: DiagnosticoTecnico;
  items: ItemOrden[];     // Repuestos y servicios aplicados
  
  estado: EstadoOrden;
  
  fechaRecepcion: Date;
  fechaActualizacion: Date;
  fechaEntrega?: Date;    // Solo cuando se entrega al cliente
  
  // Totales de la pre-factura
  subtotal: number;
  iva: number;
  total: number;
}