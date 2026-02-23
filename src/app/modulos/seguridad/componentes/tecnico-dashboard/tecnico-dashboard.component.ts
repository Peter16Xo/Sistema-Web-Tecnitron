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
import { Usuario } from '../../modelos/usuario.modelo';
import { OrdenServicio } from '../../../ordenes/servicios/orden.service';

@Component({
  selector: 'app-tecnico-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrls: ['./tecnico-dashboard.component.css']
})
export class TecnicoDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;

  // Estadísticas dinámicas
  ordenesAsignadas = 0;
  reparacionesEnProgreso = 0;
  ordenesCompletadas = 0;

  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private ordenServicio: OrdenServicio // INYECTADO
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarEstadisticasDinamicas();
  }

  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (!usuarioActual || usuarioActual.rol.tipo !== 'tecnico') {
      this.router.navigate(['/dashboard']);
    } else {
      this.usuarioActual = usuarioActual;
    }
  }

  private cargarEstadisticasDinamicas(): void {
    this.ordenServicio.ordenes$.pipe(takeUntil(this.destroy$)).subscribe(ordenes => {
      // Pendientes de revisar (Recibido o Diagnóstico)
      this.ordenesAsignadas = ordenes.filter(o => o.estado === 'Recibido' || o.estado === 'Diagnóstico').length;
      // En proceso activo
      this.reparacionesEnProgreso = ordenes.filter(o => o.estado === 'En Reparación').length;
      // Terminadas por el técnico
      this.ordenesCompletadas = ordenes.filter(o => o.estado === 'Listo' || o.estado === 'Entregado').length;
    });
  }

  irAListarRepuestos() { this.router.navigate(['/inventario/listar-repuestos']); }
  
  // NUEVO: Método para ir a sus órdenes
  irAMisOrdenes() { this.router.navigate(['/ordenes']); }

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