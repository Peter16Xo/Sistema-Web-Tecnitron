/* CONTROLADOR: Dashboard Recepcionista
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
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
  
  // Métodos de navegación rápida
  irARegistrarCliente() {
    // ENVIAMOS EL PARÁMETRO returnToList PARA FORZAR LA SALIDA HACIA LA LISTA
    this.router.navigate(['/clientes/nuevo'], { queryParams: { returnToList: 'true' } });
  }

  irABuscarCliente() {
    this.router.navigate(['/clientes'], { queryParams: { buscar: 1 } });
  }

  irAListaClientes() {
    this.router.navigate(['/clientes']);
  }
  
  // Navegación al catálogo de inventario
  irACatalogoInventario() {
    this.router.navigate(['/inventario/listar-repuestos']);
  }

  // PROPIEDADES: Control de usuario autenticado
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;
  sesionActual: SesionUsuario | null = null;

  // PROPIEDADES: Estadísticas y datos
  ordenesPendientes = 0;
  clientesRegistrados = 0;
  serviciosDisponibles = 0;

  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarEstadisticas();
  }

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

  private cargarEstadisticas(): void {
    this.ordenesPendientes = 5;
    this.clientesRegistrados = 24;
    this.serviciosDisponibles = 12;
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