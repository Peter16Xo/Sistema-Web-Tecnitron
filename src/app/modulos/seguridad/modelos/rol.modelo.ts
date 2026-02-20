/**
 * MODELO: Rol
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Define la estructura de datos para los roles de usuario en el sistema.
 *              Pertenece a RF-SEG-001: Autenticación de usuarios con roles diferenciados.
 */

export enum TipoRol {
  ADMINISTRADOR = 'administrador',
  RECEPCIONISTA = 'recepcionista',
  TECNICO = 'tecnico'
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoRol;
  permisos: string[];
  activo: boolean;
  fechaCreacion: Date;
}
