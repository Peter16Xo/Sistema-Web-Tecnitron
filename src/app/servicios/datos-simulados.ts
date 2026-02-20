/**
 * DATOS SIMULADOS
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Base de datos simulada en memoria con usuarios y roles predefinidos.
 *              Esta información es temporal y se reinicia al recargar la aplicación.
 *              En producción, estos datos vendrían de una base de datos real.
 */

import { Usuario, SesionUsuario } from '../modulos/seguridad/modelos/usuario.modelo';
import { Rol, TipoRol } from '../modulos/seguridad/modelos/rol.modelo';

/**
 * Base de datos simulada en memoria para roles
 */
export const rolesSimulados: Rol[] = [
  {
    id: 'rol-admin-001',
    nombre: 'Administrador',
    descripcion: 'Acceso completo a todas las funcionalidades del sistema',
    tipo: TipoRol.ADMINISTRADOR,
    permisos: [
      'gestionar-usuarios',
      'gestionar-clientes',
      'gestionar-inventario',
      'gestionar-ordenes',
      'gestionar-facturacion',
      'gestionar-reportes',
      'ver-reportes-avanzados'
    ],
    activo: true,
    fechaCreacion: new Date('2026-01-01')
  },
  {
    id: 'rol-recep-001',
    nombre: 'Recepcionista',
    descripcion: 'Gestión de clientes y registro de órdenes de servicio',
    tipo: TipoRol.RECEPCIONISTA,
    permisos: [
      'gestionar-clientes',
      'crear-ordenes',
      'ver-ordenes',
      'gestionar-facturacion'
    ],
    activo: true,
    fechaCreacion: new Date('2026-01-01')
  },
  {
    id: 'rol-tecnico-001',
    nombre: 'Técnico',
    descripcion: 'Acceso a órdenes de trabajo y inventario de repuestos',
    tipo: TipoRol.TECNICO,
    permisos: [
      'ver-ordenes',
      'actualizar-ordenes',
      'gestionar-inventario',
      'ver-clientes'
    ],
    activo: true,
    fechaCreacion: new Date('2026-01-01')
  }
];

/**
 * Base de datos simulada en memoria para usuarios
 * Credenciales de prueba para cada rol
 */
export const usuariosSimulados: Usuario[] = [
  {
    id: 'usr-admin-001',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@tecnitron.com',
    usuario: 'admin',
    contrasena: 'admin123', // Débil propósito de demostración
    rol: rolesSimulados[0],
    activo: true,
    ultimaConexion: new Date('2026-02-20'),
    fechaCreacion: new Date('2026-01-01')
  },
  {
    id: 'usr-recep-001',
    nombre: 'Mary',
    apellido: 'Guzmán',
    email: 'mary.guzman@tecnitron.com',
    usuario: 'recepcion',
    contrasena: 'recep123',
    rol: rolesSimulados[1],
    activo: true,
    ultimaConexion: new Date('2026-02-19'),
    fechaCreacion: new Date('2026-01-10')
  },
  {
    id: 'usr-tecnico-001',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    email: 'carlos.mendoza@tecnitron.com',
    usuario: 'tecnico1',
    contrasena: 'tech123',
    rol: rolesSimulados[2],
    activo: true,
    ultimaConexion: new Date('2026-02-18'),
    fechaCreacion: new Date('2026-01-15')
  },
  {
    id: 'usr-tecnico-002',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@tecnitron.com',
    usuario: 'tecnico2',
    contrasena: 'tech123',
    rol: rolesSimulados[2],
    activo: true,
    ultimaConexion: new Date('2026-02-17'),
    fechaCreacion: new Date('2026-01-20')
  }
];

/**
 * Base de datos simulada en memoria para sesiones activas
 */
export let sesionesActivas: SesionUsuario[] = [];
