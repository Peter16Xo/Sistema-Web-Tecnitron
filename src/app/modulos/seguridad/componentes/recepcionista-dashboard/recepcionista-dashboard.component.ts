/* CONTROLADOR: Dashboard Recepcionista
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Dashboard para recepcionistas con funciones de atención al cliente
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Usuario, SesionUsuario } from '../../modelos/usuario.modelo';

@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recepcionista-dashboard.component.html',
  styleUrls: ['./recepcionista-dashboard.component.css']
})
export class RecepcionistaDashboardComponent implements OnInit, OnDestroy {
  // PROPIEDADES: Control de usuario autenticado
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;
  sesionActual: SesionUsuario | null = null;

  // PROPIEDADES: Estadísticas y datos
  ordenesPendientes = 0;
  clientesRegistrados = 0;
  serviciosDisponibles = 0;

  /**
   * Constructor del componente
   * @param autenticacionServicio Servicio de autenticación
   * @param router Servicio de enrutamiento
   */
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  /**
   * Inicializa el componente
   */
  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarEstadisticas();
  }

  /**
   * Verifica que el usuario esté autenticado y sea recepcionista
   */
  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    const sesionActual = this.autenticacionServicio.obtenerSesionActual();

    if (!usuarioActual || usuarioActual.rol.tipo !== 'recepcionista') {
      this.router.navigate(['/dashboard']);
    } else {
      this.usuarioActual = usuarioActual;
      this.sesionActual = sesionActual;
    }
  }

  /**
   * Carga las estadísticas del sistema
   */
  private cargarEstadisticas(): void {
    // Aquí se cargarían datos desde servicios
    this.ordenesPendientes = 5;
    this.clientesRegistrados = 24;
    this.serviciosDisponibles = 12;
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
