// CONTROLADOR: ValidacionRolComponent
/**
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Componente para mostrar información de roles y permisos del usuario autenticado.
 *              Valida el acceso según el rol del usuario.
 *              Pertenece a RF-SEG-001: Validación de roles y permisos.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { SesionUsuario } from '../../modelos/usuario.modelo';

@Component({
  selector: 'app-validacion-rol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validacion-rol.component.html',
  styleUrls: ['./validacion-rol.component.css']
})
export class ValidacionRolComponent implements OnInit {
  
  usuarioAutenticado: Usuario | null = null;
  sesionActiva: SesionUsuario | null = null;
  tiempoDesdeConexion: string = '';

  constructor(private autenticacionServicio: AutenticacionServicio) {
    // Actualizar tiempo cada segundo
    setInterval(() => {
      this.actualizarTiempoConexion();
    }, 1000);
  }

  /**
   * Inicialización del componente
   * Obtiene información del usuario y sesión actual
   */
  ngOnInit(): void {
    this.usuarioAutenticado = this.autenticacionServicio.obtenerUsuarioActual();
    this.sesionActiva = this.autenticacionServicio.obtenerSesionActual();
    this.actualizarTiempoConexion();

    // Suscribirse a cambios de usuario autenticado
    this.autenticacionServicio.usuarioAutenticado$.subscribe((usuario: Usuario | null) => {
      this.usuarioAutenticado = usuario;
    });

    // Suscribirse a cambios de sesión
    this.autenticacionServicio.sesionActiva$.subscribe((sesion: SesionUsuario | null) => {
      this.sesionActiva = sesion;
      this.actualizarTiempoConexion();
    });
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * RF-SEG-001: Validación de permisos basada en rol
   * @param permiso - Nombre del permiso a verificar
   * @returns true si el usuario tiene el permiso
   */
  public tienePermiso(permiso: string): boolean {
    if (!this.usuarioAutenticado) {
      return false;
    }
    return this.usuarioAutenticado.rol.permisos.includes(permiso);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param permisos - Array de permisos
   * @returns true si tiene al menos uno
   */
  public tieneAlgunPermiso(permisos: string[]): boolean {
    if (!this.usuarioAutenticado) {
      return false;
    }
    return permisos.some(permiso => 
      this.usuarioAutenticado!.rol.permisos.includes(permiso)
    );
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param permisos - Array de permisos
   * @returns true si tiene todos
   */
  public tienePermisosCompletos(permisos: string[]): boolean {
    if (!this.usuarioAutenticado) {
      return false;
    }
    return permisos.every(permiso => 
      this.usuarioAutenticado!.rol.permisos.includes(permiso)
    );
  }

  /**
   * Obtiene el nombre del rol del usuario
   * @returns Nombre del rol
   */
  public obtenerNombreRol(): string {
    return this.usuarioAutenticado?.rol.nombre || 'Sin rol';
  }

  /**
   * Obtiene la descripción del rol del usuario
   * @returns Descripción del rol
   */
  public obtenerDescripcionRol(): string {
    return this.usuarioAutenticado?.rol.descripcion || 'Sin descripción disponible';
  }

  /**
   * Obtiene la lista de permisos del usuario
   * @returns Array con los permisos
   */
  public obtenerPermisos(): string[] {
    return this.usuarioAutenticado?.rol.permisos || [];
  }

  /**
   * Calcula el tiempo transcurrido desde la conexión
   * @private
   */
  private actualizarTiempoConexion(): void {
    if (!this.sesionActiva) {
      this.tiempoDesdeConexion = '';
      return;
    }

    const ahora = new Date().getTime();
    const conexion = new Date(this.sesionActiva.horaConexion).getTime();
    const diferencia = Math.floor((ahora - conexion) / 1000); // en segundos

    if (diferencia < 60) {
      this.tiempoDesdeConexion = `${diferencia} segundo${diferencia !== 1 ? 's' : ''}`;
    } else if (diferencia < 3600) {
      const minutos = Math.floor(diferencia / 60);
      this.tiempoDesdeConexion = `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else if (diferencia < 86400) {
      const horas = Math.floor(diferencia / 3600);
      this.tiempoDesdeConexion = `${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      const dias = Math.floor(diferencia / 86400);
      this.tiempoDesdeConexion = `${dias} día${dias !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Verifica si la sesión está activa
   * @returns true si hay sesión
   */
  public estaSesionActiva(): boolean {
    return this.sesionActiva !== null && this.usuarioAutenticado !== null;
  }

  /**
   * Obtiene información del token en formato resumido
   * @returns Primeros caracteres del token
   */
  public obtenerTokenResumido(): string {
    if (!this.sesionActiva) {
      return '';
    }
    return this.sesionActiva.tokenSesion.substring(0, 10) + '...';
  }
}
