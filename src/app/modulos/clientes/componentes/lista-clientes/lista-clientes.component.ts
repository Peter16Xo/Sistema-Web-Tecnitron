/**
 * COMPONENTE: Lista Clientes
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Visualiza y gestiona la lista completa de clientes para administrador
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
  criterioBusqueda = '';
  cargandoClientes = false;

  // Control de filtrados
  mostrarActivos = true;
  mostrarInactivos = false;

  // Estadísticas
  totalClientes = 0;
  clientesActivos = 0;
  clientesInactivos = 0;

  // Mensajes
  mensajeExito = '';
  mensajeError = '';

  usuarioActual: any;

  constructor(
    private clienteServicio: ClienteServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    this.cargarClientes();
    this.route.queryParams.subscribe(params => {
      if (params['buscar'] && this.inputBusqueda) {
        setTimeout(() => {
          this.inputBusqueda.nativeElement.focus();
        }, 300);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarClientes(): void {
    this.cargandoClientes = true;
    this.clienteServicio.obtenerTodosLosClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (clientes: Cliente[]) => {
          this.todosLosClientes = clientes;
          this.aplicarFiltros();
          this.actualizarEstadisticas();
          this.cargandoClientes = false;
        },
        (error) => {
          console.error('Error al cargar clientes:', error);
          this.mensajeError = 'Error al cargar los clientes';
          this.cargandoClientes = false;
        }
      );
  }

  /**
   * Aplica filtros de búsqueda y estado
   */
  private aplicarFiltros(): void {
    let resultado = [...this.todosLosClientes];

    // Filtrar por estado (activo/inactivo)
    resultado = resultado.filter(c => {
      if (this.mostrarActivos && c.activo) return true;
      if (this.mostrarInactivos && !c.activo) return true;
      return false;
    });

    // Filtrar por criterio de búsqueda
    if (this.criterioBusqueda.trim()) {
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(this.criterioBusqueda.toLowerCase()) ||
        c.apellido.toLowerCase().includes(this.criterioBusqueda.toLowerCase()) ||
        c.cedula.includes(this.criterioBusqueda) ||
        c.email.toLowerCase().includes(this.criterioBusqueda.toLowerCase()) ||
        c.telefono.includes(this.criterioBusqueda)
      );
    }

    this.clientesFiltrados = resultado;
  }

  /**
   * Actualiza las estadísticas de clientes
   */
  private actualizarEstadisticas(): void {
    this.totalClientes = this.todosLosClientes.length;
    this.clientesActivos = this.todosLosClientes.filter(c => c.activo).length;
    this.clientesInactivos = this.todosLosClientes.filter(c => !c.activo).length;
  }

  /**
   * Busca clientes por criterio
   */
  buscar(): void {
    this.aplicarFiltros();
  }

  /**
   * Alterna el filtro de clientes activos
   */
  alternarActivos(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.aplicarFiltros();
  }

  /**
   * Alterna el filtro de clientes inactivos
   */
  alternarInactivos(): void {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.aplicarFiltros();
  }

  /**
   * Desactiva un cliente
   */
  desactivarCliente(clienteId: string): void {
    if (confirm('¿Está seguro de desactivar este cliente?')) {
      this.clienteServicio.desactivarCliente(clienteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (exitoso: boolean) => {
            if (exitoso) {
              this.mensajeExito = 'Cliente desactivado correctamente';
              this.cargarClientes();
              setTimeout(() => this.mensajeExito = '', 3000);
            }
          }
        );
    }
  }

  /**
   * Navega al formulario de edición
   */
  editarCliente(clienteId: string): void {
    // Si es recepcionista, solo puede editar contacto
    if (this.usuarioActual?.rol?.tipo === 'recepcionista') {
      this.router.navigate(['/clientes/editar', clienteId], { queryParams: { contacto: 1 } });
    } else {
      this.router.navigate(['/clientes/editar', clienteId]);
    }
  }

  /**
   * Navega al formulario de nuevo cliente
   */
  nuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  /**
   * Cancela búsqueda y limpia filtros
   */
  limpiarBusqueda(): void {
    this.criterioBusqueda = '';
    this.mostrarActivos = true;
    this.mostrarInactivos = false;
    this.aplicarFiltros();
  }

  /**
   * Visualiza el historial de reparaciones de un cliente
   */
  verHistorialCliente(clienteId: string): void {
    // Solo administrador puede ver historial
    if (this.usuarioActual?.rol?.tipo !== 'recepcionista') {
      this.clienteServicio.obtenerClienteConHistorial(clienteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (clienteConHistorial: any) => {
            if (clienteConHistorial) {
              const cliente = this.todosLosClientes.find(c => c.id === clienteId);
              if (cliente) {
                alert(`\n                  HISTORIAL DEL CLIENTE - ${cliente.nombre} ${cliente.apellido}\n                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n                  Cédula: ${cliente.cedula}\n                  Email: ${cliente.email}\n                  Teléfono: ${cliente.telefono}\n                  \n                  Órdenes de servicio: ${cliente.numeroOrdenes || 0}\n                  ${cliente.notas ? 'Notas: ' + cliente.notas : ''}\n                  \n                  [Este módulo se integrará con el módulo de Órdenes para mostrar el historial de reparaciones]\n                `);
              }
            }
          }
        );
    }
  }

    /**
     * Asocia un cliente a una nueva orden (placeholder)
     */
    asociarAOrden(cliente: Cliente): void {
      // Aquí va la lógica para asociar el cliente a una orden
      alert(`Cliente ${cliente.nombre} ${cliente.apellido} asociado a una nueva orden (demo)`);
    }
}
