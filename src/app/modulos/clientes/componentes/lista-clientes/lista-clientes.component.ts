/**
 * COMPONENTE: Lista Clientes
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Visualiza y gestiona la lista completa de clientes y su historial.
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Cliente } from '../../modelos/cliente.modelo';

import { OrdenTrabajo } from '../../../ordenes/modelos/orden.modelo';
import { OrdenServicio } from '../../../ordenes/servicios/orden.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css']
})
export class ListaClientesComponent implements OnInit, OnDestroy {
  @ViewChild('inputBusqueda') inputBusqueda!: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();

  // Datos de clientes
  todosLosClientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  todasLasOrdenes: OrdenTrabajo[] = []; // Guardamos las órdenes para cruzarlas
  
  criterioBusqueda = '';
  cargandoClientes = false;

  // Control de filtrados
  mostrarActivos = true;
  mostrarInactivos = false;
  esAdministrador = false;

  // Estadísticas
  totalClientes = 0;
  clientesActivos = 0;
  clientesInactivos = 0;

  // Mensajes
  mensajeExito = '';
  mensajeError = '';

  // CONTROL DEL MODAL DE HISTORIAL
  modalAbierto = false;
  clienteSeleccionadoHistorial: Cliente | null = null;
  ordenesDelCliente: OrdenTrabajo[] = [];

  usuarioActual: any;

  constructor(
    private clienteServicio: ClienteServicio,
    private ordenServicio: OrdenServicio, // INYECTAMOS EL SERVICIO DE ÓRDENES
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    this.esAdministrador = this.usuarioActual?.rol?.tipo === 'administrador';
    
    if (!this.esAdministrador) {
      this.mostrarInactivos = false;
    }

    this.cargarClientesYOrdenes(); // Cargamos ambos
    
    this.route.queryParams.subscribe(params => {
      if (params['buscar'] && this.inputBusqueda) {
        setTimeout(() => this.inputBusqueda.nativeElement.focus(), 300);
      }
    });
  }

  /**
   * Carga clientes y órdenes para cruzar datos y contar
   */
  private cargarClientesYOrdenes(): void {
    this.cargandoClientes = true;

    // 1. Obtener todas las órdenes
    this.ordenServicio.obtenerTodasLasOrdenes().pipe(takeUntil(this.destroy$)).subscribe(ordenes => {
      this.todasLasOrdenes = ordenes;

      // 2. Obtener clientes
      this.clienteServicio.obtenerTodosLosClientes().pipe(takeUntil(this.destroy$)).subscribe(clientes => {
        
        // 3. Cruzar datos: Contar dinámicamente las órdenes por cliente
        this.todosLosClientes = clientes.map(cliente => {
          const cantidad = this.todasLasOrdenes.filter(o => o.clienteId === cliente.id).length;
          return { ...cliente, numeroOrdenes: cantidad };
        });

        this.aplicarFiltros();
        this.actualizarEstadisticas();
        this.cargandoClientes = false;
      });
    });
  }

  private aplicarFiltros(): void {
    let resultado = [...this.todosLosClientes];

    resultado = resultado.filter(c => {
      if (this.mostrarActivos && c.activo) return true;
      if (this.mostrarInactivos && !c.activo) return true;
      return false;
    });

    if (this.criterioBusqueda.trim()) {
      const busqueda = this.criterioBusqueda.toLowerCase();
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(busqueda) ||
        c.apellido.toLowerCase().includes(busqueda) ||
        c.cedula.includes(busqueda) ||
        c.email.toLowerCase().includes(busqueda) ||
        c.telefono.includes(busqueda)
      );
    }
    this.clientesFiltrados = resultado;
  }

  private actualizarEstadisticas(): void {
    this.totalClientes = this.todosLosClientes.length;
    this.clientesActivos = this.todosLosClientes.filter(c => c.activo).length;
    this.clientesInactivos = this.todosLosClientes.filter(c => !c.activo).length;
  }

  buscar(): void { this.aplicarFiltros(); }
  alternarActivos(): void { this.mostrarActivos = !this.mostrarActivos; this.aplicarFiltros(); }
  alternarInactivos(): void { this.mostrarInactivos = !this.mostrarInactivos; this.aplicarFiltros(); }

  desactivarCliente(clienteId: string): void {
    if (confirm('¿Está seguro de desactivar este cliente?')) {
      this.clienteServicio.desactivarCliente(clienteId).subscribe(exitoso => {
        if (exitoso) {
          this.mensajeExito = 'Cliente desactivado correctamente';
          this.cargarClientesYOrdenes();
          setTimeout(() => this.mensajeExito = '', 3000);
        }
      });
    }
  }

  editarCliente(clienteId: string): void {
    this.router.navigate(['/clientes/editar', clienteId]);
  }
  nuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }
  limpiarBusqueda(): void {
    this.criterioBusqueda = '';
    this.mostrarActivos = true;
    this.mostrarInactivos = false;
    this.aplicarFiltros();
  }

  /**
   * ==========================================
   * LÓGICA DEL MODAL DE HISTORIAL
   * ==========================================
   */
  verHistorialCliente(clienteId: string): void {
    if (this.esAdministrador) {
      // 1. Buscamos al cliente
      this.clienteSeleccionadoHistorial = this.todosLosClientes.find(c => c.id === clienteId) || null;
      
      // 2. Filtramos sus órdenes. Mostraremos todas, pero las terminadas destacarán.
      this.ordenesDelCliente = this.todasLasOrdenes.filter(o => o.clienteId === clienteId);
      
      // 3. Abrimos el modal
      this.modalAbierto = true;
    }
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.clienteSeleccionadoHistorial = null;
    this.ordenesDelCliente = [];
  }

  // Ahora el botón asociar te lleva directamente a crear una nueva orden
  asociarAOrden(cliente: Cliente): void {
    this.router.navigate(['/ordenes/nueva']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}