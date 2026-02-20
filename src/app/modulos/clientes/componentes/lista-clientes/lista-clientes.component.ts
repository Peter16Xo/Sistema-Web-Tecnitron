/**
 * COMPONENTE: Lista Clientes
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Visualiza y gestiona la lista completa de clientes para administrador
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  // Control de lifecycle
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

  constructor(
    private clienteServicio: ClienteServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Verifica que el usuario esté autenticado y sea administrador
   */
  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (!usuarioActual || usuarioActual.rol.tipo !== 'administrador') {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Carga todos los clientes del sistema
   */
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
    this.router.navigate(['/clientes/editar', clienteId]);
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
}
