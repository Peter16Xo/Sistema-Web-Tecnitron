/**
 * SERVICIO: Usuario
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Servicio para gestionar operaciones CRUD de usuarios en el sistema.
 * Incluye búsqueda, actualización y gestión de usuarios.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Usuario } from '../modulos/seguridad/modelos/usuario.modelo';
import { usuariosSimulados } from './datos-simulados';

@Injectable({
  providedIn: 'root'
})
export class UsuarioServicio {
  
  constructor() { }

  /**
   * Obtiene un usuario por su ID
   * @param id - Identificador del usuario
   * @returns Observable con el usuario encontrado
   */
  public obtenerUsuarioPorId(id: string): Observable<Usuario | null> {
    const usuario = usuariosSimulados.find(u => u.id === id);
    return of(usuario || null);
  }

  /**
   * Obtiene un usuario por nombre de usuario
   * @param nombreUsuario - Nombre de usuario a buscar
   * @returns Observable con el usuario encontrado
   */
  public obtenerUsuarioPorNombreUsuario(nombreUsuario: string): Observable<Usuario | null> {
    const usuario = usuariosSimulados.find(u => u.usuario === nombreUsuario);
    return of(usuario || null);
  }

  /**
   * Obtiene todos los usuarios del sistema (Activos e Inactivos)
   * CORREGIDO: Ya no se filtran solo los activos, permitiendo ver el historial completo
   * @returns Observable con lista de usuarios
   */
  public obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return of([...usuariosSimulados]);
  }

  /**
   * Busca usuarios por criterios (Activos e Inactivos)
   * @param criterio - Texto a buscar
   * @returns Observable con usuarios coincidentes
   */
  public buscarUsuarios(criterio: string): Observable<Usuario[]> {
    const resultados = usuariosSimulados.filter(u => 
      (
        u.nombre.toLowerCase().includes(criterio.toLowerCase()) ||
        u.apellido.toLowerCase().includes(criterio.toLowerCase()) ||
        u.email.toLowerCase().includes(criterio.toLowerCase()) ||
        u.usuario.toLowerCase().includes(criterio.toLowerCase())
      )
    );
    return of(resultados);
  }

  /**
   * Obtiene usuarios por rol
   * @param idRol - ID del rol a filtrar
   * @returns Observable con usuarios de ese rol
   */
  public obtenerUsuariosPorRol(idRol: string): Observable<Usuario[]> {
    const usuarios = usuariosSimulados.filter(u => u.rol.id === idRol);
    return of(usuarios);
  }

  /**
   * Agrega un nuevo usuario al sistema
   * @param usuario - Nuevo usuario a agregar
   * @returns Observable con confirmación
   */
  public agregarUsuario(usuario: Usuario): Observable<boolean> {
    usuariosSimulados.push(usuario);
    return of(true);
  }

  /**
   * Actualiza un usuario existente
   * @param usuarioActualizado - Usuario con datos actualizados
   * @returns Observable con confirmación
   */
  public actualizarUsuario(usuarioActualizado: Usuario): Observable<boolean> {
    const indice = usuariosSimulados.findIndex(u => u.id === usuarioActualizado.id);
    if (indice !== -1) {
      usuariosSimulados[indice] = usuarioActualizado;
      return of(true);
    }
    return of(false);
  }

  /**
   * Desactiva un usuario del sistema (Soft Delete)
   * @param id - ID del usuario a desactivar
   * @returns Observable con confirmación
   */
  public desactivarUsuario(id: string): Observable<boolean> {
    const usuario = usuariosSimulados.find(u => u.id === id);
    if (usuario) {
      usuario.activo = false;
      return of(true);
    }
    return of(false);
  }
}