/* CONTROLADOR: Dashboard Administrador
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
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
  
  // Métodos de navegación rápida
  irAListaClientes() {
    this.router.navigate(['/clientes']);
  }

  irABuscarCliente() {
    this.router.navigate(['/clientes']);
  }

  irAListarRepuestos() {
    this.router.navigate(['/inventario/listar-repuestos']);
  }

  irARegistrarServicio() {
    this.router.navigate(['/inventario/registrar-servicio']);
  }

  // PROPIEDADES: Control de usuario autenticado
  usuarioActual: Usuario | null = null;
  sesionActual: SesionUsuario | null = null;

  private destroy$ = new Subject<void>();
  todosLosUsuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  criterioBusqueda = '';
  
  // NUEVO: Control de filtrados por estado
  mostrarActivos = true;
  mostrarInactivos = false;

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

  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private usuarioServicio: UsuarioServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarUsuarios();
  }

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

  private cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.usuarioServicio.obtenerTodosLosUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (usuarios: Usuario[]) => {
          this.todosLosUsuarios = usuarios;
          this.actualizarContadores();
          this.aplicarFiltros(); // NUEVO: Aplicar filtros después de cargar
          this.cargandoUsuarios = false;
        },
        (error) => {
          console.error('Error al cargar usuarios:', error);
          this.mensajeError = 'Error al cargar los usuarios';
          this.cargandoUsuarios = false;
        }
      );
  }

  private actualizarContadores(): void {
    this.usuariosActivos = this.todosLosUsuarios.filter(u => u.activo).length;
    this.usuariosInactivos = this.todosLosUsuarios.filter(u => !u.activo).length;
  }

  /**
   * NUEVO: Aplica filtros de búsqueda de texto y checkboxes de estado
   */
  private aplicarFiltros(): void {
    let resultado = [...this.todosLosUsuarios];

    // 1. Filtrar por estado (checkboxes)
    resultado = resultado.filter(u => {
      if (this.mostrarActivos && u.activo) return true;
      if (this.mostrarInactivos && !u.activo) return true;
      return false;
    });

    // 2. Filtrar por texto de búsqueda
    if (this.criterioBusqueda.trim()) {
      const criterio = this.criterioBusqueda.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombre.toLowerCase().includes(criterio) ||
        u.apellido.toLowerCase().includes(criterio) ||
        u.email.toLowerCase().includes(criterio) ||
        u.usuario.toLowerCase().includes(criterio)
      );
    }

    this.usuariosFiltrados = resultado;
  }

  /**
   * Disparado al escribir en el input de búsqueda
   */
  buscarUsuarios(): void {
    this.aplicarFiltros();
  }

  /**
   * NUEVO: Alterna checkbox de activos
   */
  alternarActivos(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.aplicarFiltros();
  }

  /**
   * NUEVO: Alterna checkbox de inactivos
   */
  alternarInactivos(): void {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.aplicarFiltros();
  }

  /**
   * NUEVO: Limpia la búsqueda y resetea filtros
   */
  limpiarBusqueda(): void {
    this.criterioBusqueda = '';
    this.mostrarActivos = true;
    this.mostrarInactivos = false;
    this.aplicarFiltros();
  }

  abrirFormularioNuevo(): void {
    this.mostrarFormularioNuevo = true;
    this.mostrarFormularioEdicion = false;
    this.usuarioSeleccionado = null;
    this.limpiarFormulario();
    this.limpiarMensajes();
  }

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

  cerrarFormularios(): void {
    this.mostrarFormularioNuevo = false;
    this.mostrarFormularioEdicion = false;
    this.usuarioSeleccionado = null;
    this.limpiarFormulario();
    this.limpiarMensajes();
  }

  guardarUsuario(): void {
    if (!this.validarFormulario()) return;

    try {
      if (this.mostrarFormularioNuevo) {
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

  desactivarUsuario(usuario: Usuario): void {
    const confirmacion = confirm(`¿Estás seguro de que deseas desactivar la cuenta del usuario ${usuario.nombre} ${usuario.apellido}? Ya no podrá iniciar sesión en el sistema.`);
    
    if (confirmacion) {
      this.usuarioServicio.desactivarUsuario(usuario.id);
      this.mensajeExito = `La cuenta de "${usuario.usuario}" ha sido desactivada correctamente.`;
      this.cargarUsuarios(); 
      setTimeout(() => this.mensajeExito = '', 3000);
    }
  }

  resetearContrasena(usuario: Usuario): void {
    if (confirm(`¿Reiniciar contraseña de ${usuario.nombre} ${usuario.apellido}?`)) {
      usuario.contrasena = 'temporal123';
      this.usuarioServicio.actualizarUsuario(usuario);
      this.mensajeExito = `Contraseña reiniciada. Contraseña temporal: temporal123`;
    }
  }

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

  private obtenerNombreRol(rolId: string): string {
    const roles: { [key: string]: string } = {
      '1': 'Administrador',
      '2': 'Recepcionista',
      '3': 'Técnico'
    };
    return roles[rolId] || 'Desconocido';
  }

  private obtenerTipoRol(rolId: string): 'administrador' | 'recepcionista' | 'tecnico' {
    const roles: { [key: string]: 'administrador' | 'recepcionista' | 'tecnico' } = {
      '1': 'administrador',
      '2': 'recepcionista',
      '3': 'tecnico'
    };
    return roles[rolId] || 'tecnico';
  }

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

  private limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cerrarSesion(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.autenticacionServicio.cerrarSesion();
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}