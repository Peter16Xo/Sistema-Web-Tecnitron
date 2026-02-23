/* CONTROLADOR: Dashboard Recepcionista
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Corrección de lógica para contar solo clientes activos.
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Usuario, SesionUsuario } from '../../modelos/usuario.modelo';
import { ClienteServicio } from '../../../clientes/servicios/cliente.servicio';
import { ServicioManoObraServicio } from '../../../inventario/servicios/servicio-mano-obra.servicio';


@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recepcionista-dashboard.component.html',
  styleUrls: ['./recepcionista-dashboard.component.css']
})
export class RecepcionistaDashboardComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;

  // PROPIEDADES: Estadísticas dinámicas
  ordenesPendientes = 5;
  clientesRegistrados = 0;    
  serviciosDisponibles = 0;   

  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private clienteServicio: ClienteServicio,
    private serviciosServicio: ServicioManoObraServicio
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarEstadisticasDinamicas();
  }

  private cargarEstadisticasDinamicas(): void {
    // 1. Sincronizar contador de Clientes (SOLO ACTIVOS)
    this.clienteServicio.clientes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clientes => {
        // 👇 AQUÍ ESTÁ EL CAMBIO: Filtramos por c.activo antes de contar
        this.clientesRegistrados = clientes.filter(c => c.activo).length;
      });

    // 2. Sincronizar contador de Servicios Disponibles (SOLO ACTIVOS)
    this.serviciosServicio.servicios$
      .pipe(takeUntil(this.destroy$))
      .subscribe(servicios => {
        this.serviciosDisponibles = servicios.filter(s => s.activo).length;
      });
  }

  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (!usuarioActual || usuarioActual.rol.tipo !== 'recepcionista') {
      this.router.navigate(['/dashboard']);
    } else {
      this.usuarioActual = usuarioActual;
    }
  }

  // Métodos de navegación rápida
  irARegistrarCliente() {
    this.router.navigate(['/clientes/nuevo'], { queryParams: { returnToList: 'true' } });
  }

  irABuscarCliente() {
    this.router.navigate(['/clientes'], { queryParams: { buscar: 1 } });
  }

  irACatalogoInventario() {
    this.router.navigate(['/inventario/listar-repuestos']);
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