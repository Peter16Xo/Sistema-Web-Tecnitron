/* CONTROLADOR: Dashboard Técnico
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Dashboard para técnicos con funciones de reparación
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
  selector: 'app-tecnico-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrls: ['./tecnico-dashboard.component.css']
})
export class TecnicoDashboardComponent implements OnInit, OnDestroy {
    irAListarRepuestos() {
      this.router.navigate(['/inventario/listar-repuestos']);
    }
  // PROPIEDADES: Control de usuario autenticado
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;
  sesionActual: SesionUsuario | null = null;

  // PROPIEDADES: Estadísticas y datos
  ordenesAsignadas = 0;
  ordenesCompletadas = 0;
  reparacionesEnProgreso = 0;

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
   * Verifica que el usuario esté autenticado y sea técnico
   */
  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    const sesionActual = this.autenticacionServicio.obtenerSesionActual();

    if (!usuarioActual || usuarioActual.rol.tipo !== 'tecnico') {
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
    this.ordenesAsignadas = 8;
    this.ordenesCompletadas = 12;
    this.reparacionesEnProgreso = 3;
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
