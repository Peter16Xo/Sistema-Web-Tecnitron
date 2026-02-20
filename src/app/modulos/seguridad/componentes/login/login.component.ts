// CONTROLADOR: LoginComponent
/**
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Componente principal de autenticación (Login)
 *              Gestiona la validación de credenciales y acceso al sistema.
 *              Pertenece a RF-SEG-001: Autenticación de usuarios con roles diferenciados.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionServicio, RespuestaAutenticacion } from '../../../../servicios/autenticacion.servicio';
import { Usuario } from '../../modelos/usuario.modelo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  // Propiedades del formulario
  nombreUsuario: string = '';
  contrasena: string = '';
  
  // Estados de la aplicación
  cargando: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeExito: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  usuarioAutenticado: Usuario | null = null;
  
  // Para mostrar/ocultar contraseña
  mostrarContrasena: boolean = false;

  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  /**
   * Inicialización del componente
   * Verifica si hay sesión activa y redirecciona si es necesario
   */
  ngOnInit(): void {
    // Verificar si el usuario ya está autenticado
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (usuarioActual) {
      this.usuarioAutenticado = usuarioActual;
      this.mostrarMensajeExito = true;
      this.mensajeExito = `Ya está autenticado como ${usuarioActual.nombre}`;
    }
  }

  /**
   * Maneja el envío del formulario de login
   * Valida entrada y llama al servicio de autenticación
   * RF-SEG-001: Autenticación de usuarios
   */
  public enviarFormularioLogin(): void {
    // Validar campos obligatorios
    if (!this.validarCampos()) {
      return;
    }

    this.limpiarMensajes();
    this.cargando = true;

    // Llamar servicio de autenticación
    this.autenticacionServicio.autenticar(this.nombreUsuario, this.contrasena)
      .subscribe({
        next: (respuesta: RespuestaAutenticacion) => {
          this.cargando = false;
          
          if (respuesta.exitoso && respuesta.usuario && respuesta.sesion) {
            // Autenticación exitosa
            this.usuarioAutenticado = respuesta.usuario;
            this.mostrarMensajeExito = true;
            this.mensajeExito = respuesta.mensaje;
            
            // Redirigir al dashboard después de 1.5 segundos
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
            
            console.log('Usuario autenticado:', respuesta.usuario);
            console.log('Rol:', respuesta.usuario.rol.nombre);
            console.log('Token sesión:', respuesta.sesion.tokenSesion);
          } else {
            // Autenticación fallida
            this.mostrarMensajeError = true;
            this.mensajeError = respuesta.mensaje;
          }
        },
        error: (error: any) => {
          this.cargando = false;
          this.mostrarMensajeError = true;
          this.mensajeError = 'Error en la autenticación. Intente nuevamente.';
          console.error('Error de autenticación:', error);
        }
      });
  }

  /**
   * Cierra la sesión actual
   * Limpia datos de usuario autenticado
   */
  public cerrarSesion(): void {
    this.autenticacionServicio.cerrarSesion();
    this.usuarioAutenticado = null;
    this.limpiarFormulario();
    this.limpiarMensajes();
    this.mostrarMensajeExito = true;
    this.mensajeExito = 'Ha cerrado sesión correctamente';
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  public alternarVisibilidadContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  /**
   * Valida los campos del formulario antes de enviar
   * @returns true si los campos son válidos
   * @private
   */
  private validarCampos(): boolean {
    this.limpiarMensajes();

    if (!this.nombreUsuario.trim()) {
      this.mostrarMensajeError = true;
      this.mensajeError = 'Por favor, ingrese su nombre de usuario';
      return false;
    }

    if (!this.contrasena.trim()) {
      this.mostrarMensajeError = true;
      this.mensajeError = 'Por favor, ingrese su contraseña';
      return false;
    }

    if (this.contrasena.length < 5) {
      this.mostrarMensajeError = true;
      this.mensajeError = 'La contraseña debe tener al menos 5 caracteres';
      return false;
    }

    return true;
  }

  /**
   * Limpia el formulario de entrada
   * @private
   */
  private limpiarFormulario(): void {
    this.nombreUsuario = '';
    this.contrasena = '';
    this.mostrarContrasena = false;
  }

  /**
   * Limpia los mensajes de error y éxito
   * @private
   */
  private limpiarMensajes(): void {
    this.mostrarMensajeError = false;
    this.mostrarMensajeExito = false;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  /**
   * Carga usuarios de demostración en los campos
   * Útil para testing rápido de diferentes roles
   * @param rol - Rol a precarga (admin, recepcion, tecnico)
   */
  public cargarCredencialesDemostracion(rol: 'admin' | 'recepcion' | 'tecnico'): void {
    switch (rol) {
      case 'admin':
        this.nombreUsuario = 'admin';
        this.contrasena = 'admin123';
        break;
      case 'recepcion':
        this.nombreUsuario = 'recepcion';
        this.contrasena = 'recep123';
        break;
      case 'tecnico':
        this.nombreUsuario = 'tecnico1';
        this.contrasena = 'tech123';
        break;
    }
    this.limpiarMensajes();
  }
}
