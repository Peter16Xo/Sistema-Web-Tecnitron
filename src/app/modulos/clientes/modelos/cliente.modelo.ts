/**
 * MODELO: Cliente
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
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
