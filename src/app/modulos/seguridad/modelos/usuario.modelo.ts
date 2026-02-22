/**
 * MODELO: Usuario
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Define la estructura de datos para un usuario autenticado en el sistema.
 *              Pertenece a RF-SEG-001: Autenticación de usuarios con validación de credenciales.
 */

import { Rol, TipoRol } from './rol.modelo';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  contrasena: string; // En producción, esto se encriptaría en el backend
  rol: Rol;
  activo: boolean;
  ultimaConexion?: Date;
  fechaCreacion: Date;
}

/**
 * Interfaz para la sesión de usuario activa
 * Almacena información del usuario autenticado
 */
export interface SesionUsuario {
  idUsuario: string;
  nombre: string;
  email: string;
  rol: TipoRol;
  tokenSesion: string;
  horaConexion: Date;
}
