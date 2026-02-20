/**
 * SERVICIO: Autenticación
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Servicio que gestiona la autenticación de usuarios.
 *              Simula validación de credenciales contra base de datos en memoria.
 *              Pertenece a RF-SEG-001: Autenticación de usuarios con roles diferenciados.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario, SesionUsuario } from '../modulos/seguridad/modelos/usuario.modelo';
import { usuariosSimulados, sesionesActivas } from './datos-simulados';

/**
 * Interfaz para respuesta de autenticación
 */
export interface RespuestaAutenticacion {
  exitoso: boolean;
  mensaje: string;
  usuario?: Usuario;
  sesion?: SesionUsuario;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionServicio {
  // Observable para mantener el estado de autenticación
  private usuarioAutenticadoSubject = new BehaviorSubject<Usuario | null>(null);
  private sesionActivaSubject = new BehaviorSubject<SesionUsuario | null>(null);
  
  // Observables públicos
  public usuarioAutenticado$ = this.usuarioAutenticadoSubject.asObservable();
  public sesionActiva$ = this.sesionActivaSubject.asObservable();

  constructor() {
    this.verificarSesionGuardada();
  }

  /**
   * Método para autenticar un usuario con credenciales
   * RF-SEG-001: Valida usuario y contraseña contra registro en memoria
   * @param nombreUsuario - Nombre de usuario ingresado
   * @param contrasena - Contraseña ingresada
   * @returns Observable con resultado de autenticación
   */
  public autenticar(nombreUsuario: string, contrasena: string): Observable<RespuestaAutenticacion> {
    return new Observable(observador => {
      // Simular delay de red (500ms)
      setTimeout(() => {
        const usuario = this.validarCredenciales(nombreUsuario, contrasena);
        
        if (usuario) {
          // Crear sesión activa
          const sesion = this.crearSesion(usuario);
          
          // Actualizar observables
          this.usuarioAutenticadoSubject.next(usuario);
          this.sesionActivaSubject.next(sesion);
          
          // Guardar sesión en localStorage para persistencia
          this.guardarSesion(sesion);
          
          observador.next({
            exitoso: true,
            mensaje: `Bienvenido, ${usuario.nombre} ${usuario.apellido}`,
            usuario: usuario,
            sesion: sesion
          });
        } else {
          observador.next({
            exitoso: false,
            mensaje: 'Usuario o contraseña incorrectos. Verifique sus credenciales.'
          });
        }
        
        observador.complete();
      }, 500);
    });
  }

  /**
   * Método para cerrar sesión del usuario actual
   * Limpia datos de sesión activa
   */
  public cerrarSesion(): void {
    this.usuarioAutenticadoSubject.next(null);
    this.sesionActivaSubject.next(null);
    localStorage.removeItem('sesion-tecnitron');
    localStorage.removeItem('usuario-tecnitron');
  }

  /**
   * Método para obtener el usuario autenticado actual
   * @returns Usuario autenticado o null
   */
  public obtenerUsuarioActual(): Usuario | null {
    return this.usuarioAutenticadoSubject.value;
  }

  /**
   * Método para obtener la sesión activa actual
   * @returns Sesión activa o null
   */
  public obtenerSesionActual(): SesionUsuario | null {
    return this.sesionActivaSubject.value;
  }

  /**
   * Método para verificar si hay sesión guardada (login persistente)
   * @private
   */
  private verificarSesionGuardada(): void {
    const sesionGuardada = localStorage.getItem('sesion-tecnitron');
    const usuarioGuardado = localStorage.getItem('usuario-tecnitron');
    
    if (sesionGuardada && usuarioGuardado) {
      try {
        const sesion: SesionUsuario = JSON.parse(sesionGuardada);
        const usuario: Usuario = JSON.parse(usuarioGuardado);
        
        // Validar que la sesión no haya expirado (24 horas)
        const horaConexion = new Date(sesion.horaConexion).getTime();
        const ahora = new Date().getTime();
        const diferencia = ahora - horaConexion;
        const veinticuatroHoras = 24 * 60 * 60 * 1000;
        
        if (diferencia < veinticuatroHoras) {
          this.usuarioAutenticadoSubject.next(usuario);
          this.sesionActivaSubject.next(sesion);
        } else {
          // Sesión expirada, limpiar
          this.cerrarSesion();
        }
      } catch (error) {
        console.error('Error al recuperar sesión guardada:', error);
        this.cerrarSesion();
      }
    }
  }

  /**
   * Método privado para validar credenciales contra base de datos
   * @param nombreUsuario - Usuario a validar
   * @param contrasena - Contraseña a validar
   * @returns Usuario si es válido, null si no
   * @private
   */
  private validarCredenciales(nombreUsuario: string, contrasena: string): Usuario | null {
    const usuario = usuariosSimulados.find(
      u => u.usuario === nombreUsuario && 
           u.contrasena === contrasena && 
           u.activo === true
    );
    return usuario || null;
  }

  /**
   * Método privado para crear una nueva sesión
   * @param usuario - Usuario autenticado
   * @returns Nueva sesión creada
   * @private
   */
  private crearSesion(usuario: Usuario): SesionUsuario {
    const tokenSesion = this.generarTokenSesion();
    
    const sesion: SesionUsuario = {
      idUsuario: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.tipo,
      tokenSesion: tokenSesion,
      horaConexion: new Date()
    };
    
    // Agregar a sesiones activas
    sesionesActivas.push(sesion);
    
    return sesion;
  }

  /**
   * Método privado para generar un token de sesión
   * @returns Token único
   * @private
   */
  private generarTokenSesion(): string {
    return `tkn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Método privado para guardar sesión en localStorage
   * @param sesion - Sesión a guardar
   * @private
   */
  private guardarSesion(sesion: SesionUsuario): void {
    const usuario = this.usuarioAutenticadoSubject.value;
    if (usuario) {
      localStorage.setItem('sesion-tecnitron', JSON.stringify(sesion));
      localStorage.setItem('usuario-tecnitron', JSON.stringify(usuario));
    }
  }
}
