/* CONTROLADOR: Dashboard Administrador
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Dashboard exclusivo para administradores con gestión completa de usuarios y roles
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { UsuarioServicio } from '../../../../servicios/usuario.servicio';
import { Usuario, SesionUsuario } from '../../modelos/usuario.modelo';

@Component({
  selector: 'app-administrador-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrador-dashboard.component.html',
  styleUrls: ['./administrador-dashboard.component.css']
})
export class AdministradorDashboardComponent implements OnInit, OnDestroy {
    // Métodos de navegación rápida a clientes
    irAListaClientes() {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/clientes'], { replaceUrl: true });
      });
    }

    irABuscarCliente() {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/clientes'], { replaceUrl: true });
      });
    }
  // PROPIEDADES: Control de usuario autenticado
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;
  sesionActual: SesionUsuario | null = null;

  // PROPIEDADES: Control de usuarios
  todosLosUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  criterioBusqueda = '';
  mostrarFormularioNuevo = false;
  mostrarFormularioEdicion = false;
  usuarioSeleccionado: Usuario | null = null;
  usuariosActivos = 0;
  usuariosInactivos = 0;

  // PROPIEDADES: Formulario de usuario
  formularioUsuario = {
    nombre: '',
    apellido: '',
    email: '',
    nombreUsuario: '',
    contrasena: '',
    rolId: '',
    activo: true
  };

  // PROPIEDADES: Mensajes
  mensajeExito = '';
  mensajeError = '';
  cargandoUsuarios = false;

  /**
   * Constructor del componente
   * @param autenticacionServicio Servicio de autenticación
   * @param usuarioServicio Servicio de usuarios
   * @param router Servicio de enrutamiento
   */
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private usuarioServicio: UsuarioServicio,
    private router: Router
  ) {}

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarUsuarios();
  }

  /**
   * Verifica que el usuario esté autenticado y sea administrador
   */
  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    const sesionActual = this.autenticacionServicio.obtenerSesionActual();

    if (!usuarioActual || usuarioActual.rol.tipo !== 'administrador') {
      this.router.navigate(['/dashboard']);
    } else {
      this.usuarioActual = usuarioActual;
      this.sesionActual = sesionActual;
    }
  }

  /**
   * Carga todos los usuarios del sistema
   */
  private cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.usuarioServicio.obtenerTodosLosUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (usuarios: Usuario[]) => {
          this.todosLosUsuarios = usuarios;
          this.usuariosFiltrados = [...usuarios];
          this.actualizarContadores();
          this.cargandoUsuarios = false;
        },
        (error) => {
          console.error('Error al cargar usuarios:', error);
          this.mensajeError = 'Error al cargar los usuarios';
          this.cargandoUsuarios = false;
        }
      );
  }

  /**
   * Actualiza los contadores de usuarios activos e inactivos
   */
  private actualizarContadores(): void {
    this.usuariosActivos = this.todosLosUsuarios.filter(u => u.activo).length;
    this.usuariosInactivos = this.todosLosUsuarios.filter(u => !u.activo).length;
  }

  /**
   * Busca usuarios según el criterio ingresado
   */
  buscarUsuarios(): void {
    if (!this.criterioBusqueda.trim()) {
      this.usuariosFiltrados = [...this.todosLosUsuarios];
    } else {
      this.usuarioServicio.buscarUsuarios(this.criterioBusqueda)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (usuarios: Usuario[]) => {
            this.usuariosFiltrados = usuarios;
          },
          (error) => {
            console.error('Error en búsqueda:', error);
            this.usuariosFiltrados = [];
          }
        );
    }
  }

  /**
   * Abre el formulario para crear nuevo usuario
   */
  abrirFormularioNuevo(): void {
    this.mostrarFormularioNuevo = true;
    this.mostrarFormularioEdicion = false;
    this.usuarioSeleccionado = null;
    this.limpiarFormulario();
    this.limpiarMensajes();
  }

  /**
   * Abre el formulario para editar usuario
   * @param usuario Usuario a editar
   */
  abrirFormularioEdicion(usuario: Usuario): void {
    this.mostrarFormularioEdicion = true;
    this.mostrarFormularioNuevo = false;
    this.usuarioSeleccionado = usuario;
    this.formularioUsuario = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      nombreUsuario: usuario.usuario,
      contrasena: '',
      rolId: usuario.rol.id,
      activo: usuario.activo
    };
    this.limpiarMensajes();
  }

  /**
   * Cierra los formularios
   */
  cerrarFormularios(): void {
    this.mostrarFormularioNuevo = false;
    this.mostrarFormularioEdicion = false;
    this.usuarioSeleccionado = null;
    this.limpiarFormulario();
    this.limpiarMensajes();
  }

  /**
   * Guarda un nuevo usuario o actualiza uno existente
   */
  guardarUsuario(): void {
    if (!this.validarFormulario()) return;

    try {
      if (this.mostrarFormularioNuevo) {
        // Crear nuevo usuario
        const nuevoUsuario: Usuario = {
          id: Date.now().toString(),
          nombre: this.formularioUsuario.nombre,
          apellido: this.formularioUsuario.apellido,
          email: this.formularioUsuario.email,
          usuario: this.formularioUsuario.nombreUsuario,
          contrasena: this.formularioUsuario.contrasena,
          rol: {
            id: this.formularioUsuario.rolId,
            nombre: this.obtenerNombreRol(this.formularioUsuario.rolId),
            descripcion: '',
            tipo: this.obtenerTipoRol(this.formularioUsuario.rolId) as any,
            permisos: [],
            activo: true,
            fechaCreacion: new Date()
          },
          activo: this.formularioUsuario.activo,
          ultimaConexion: undefined,
          fechaCreacion: new Date()
        };

        this.usuarioServicio.agregarUsuario(nuevoUsuario);
        this.mensajeExito = `Usuario "${nuevoUsuario.usuario}" creado exitosamente`;
      } else if (this.usuarioSeleccionado && this.mostrarFormularioEdicion) {
        // Actualizar usuario existente
        this.usuarioSeleccionado.nombre = this.formularioUsuario.nombre;
        this.usuarioSeleccionado.apellido = this.formularioUsuario.apellido;
        this.usuarioSeleccionado.email = this.formularioUsuario.email;
        this.usuarioSeleccionado.usuario = this.formularioUsuario.nombreUsuario;
        this.usuarioSeleccionado.rol.id = this.formularioUsuario.rolId;
        this.usuarioSeleccionado.rol.tipo = this.obtenerTipoRol(this.formularioUsuario.rolId) as any;
        this.usuarioSeleccionado.activo = this.formularioUsuario.activo;

        if (this.formularioUsuario.contrasena) {
          this.usuarioSeleccionado.contrasena = this.formularioUsuario.contrasena;
        }

        this.usuarioServicio.actualizarUsuario(this.usuarioSeleccionado);
        this.mensajeExito = `Usuario "${this.usuarioSeleccionado.usuario}" actualizado exitosamente`;
      }

      this.cargarUsuarios();
      setTimeout(() => this.cerrarFormularios(), 2000);
    } catch (error) {
      this.mensajeError = 'Error al guardar el usuario: ' + (error as any).message;
    }
  }

  /**
   * Desactiva un usuario
   * @param usuario Usuario a desactivar
   */
  desactivarUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de que deseas desactivar a ${usuario.nombre} ${usuario.apellido}?`)) {
      this.usuarioServicio.desactivarUsuario(usuario.id);
      this.mensajeExito = `Usuario "${usuario.usuario}" desactivado`;
      this.cargarUsuarios();
    }
  }

  /**
   * Reinicia la contraseña de un usuario a una contraseña por defecto
   * @param usuario Usuario
   */
  resetearContrasena(usuario: Usuario): void {
    if (confirm(`¿Reiniciar contraseña de ${usuario.nombre} ${usuario.apellido}?`)) {
      usuario.contrasena = 'temporal123';
      this.usuarioServicio.actualizarUsuario(usuario);
      this.mensajeExito = `Contraseña reiniciada. Contraseña temporal: temporal123`;
    }
  }

  /**
   * Valida el formulario de usuario
   */
  private validarFormulario(): boolean {
    if (!this.formularioUsuario.nombre.trim()) {
      this.mensajeError = 'El nombre es requerido';
      return false;
    }
    if (!this.formularioUsuario.apellido.trim()) {
      this.mensajeError = 'El apellido es requerido';
      return false;
    }
    if (!this.formularioUsuario.email.trim()) {
      this.mensajeError = 'El email es requerido';
      return false;
    }
    if (!this.formularioUsuario.nombreUsuario.trim()) {
      this.mensajeError = 'El nombre de usuario es requerido';
      return false;
    }
    if (this.mostrarFormularioNuevo && !this.formularioUsuario.contrasena.trim()) {
      this.mensajeError = 'La contraseña es requerida para nuevos usuarios';
      return false;
    }
    if (!this.formularioUsuario.rolId) {
      this.mensajeError = 'Debes seleccionar un rol';
      return false;
    }
    return true;
  }

  /**
   * Obtiene el nombre del rol según su ID
   * @param rolId ID del rol
   */
  private obtenerNombreRol(rolId: string): string {
    const roles: { [key: string]: string } = {
      '1': 'Administrador',
      '2': 'Recepcionista',
      '3': 'Técnico'
    };
    return roles[rolId] || 'Desconocido';
  }

  /**
   * Obtiene el tipo de rol según su ID
   * @param rolId ID del rol
   */
  private obtenerTipoRol(rolId: string): 'administrador' | 'recepcionista' | 'tecnico' {
    const roles: { [key: string]: 'administrador' | 'recepcionista' | 'tecnico' } = {
      '1': 'administrador',
      '2': 'recepcionista',
      '3': 'tecnico'
    };
    return roles[rolId] || 'tecnico';
  }

  /**
   * Limpia el formulario
   */
  private limpiarFormulario(): void {
    this.formularioUsuario = {
      nombre: '',
      apellido: '',
      email: '',
      nombreUsuario: '',
      contrasena: '',
      rolId: '',
      activo: true
    };
  }

  /**
   * Limpia los mensajes de éxito y error
   */
  private limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  /**
   * Cierra sesión del usuario
   */
  cerrarSesion(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.autenticacionServicio.cerrarSesion();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
