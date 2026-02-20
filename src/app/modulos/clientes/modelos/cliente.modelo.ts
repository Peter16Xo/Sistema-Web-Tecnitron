/**
 * MODELO: Cliente
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Interfaz que define la estructura de un cliente en el sistema
 * Fecha: 2026
 */

export interface Cliente {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  activo: boolean;
  fechaRegistro: Date;
  numeroOrdenes?: number;
  ultimaCompra?: Date;
  notas?: string;
}
