// ...existing code...
/*
 * COMPONENTE: Listar Repuestos
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Muestra el listado general de repuestos registrados
 * Fecha: 2026
 */

import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';

@Component({
  selector: 'app-listar-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-repuestos.component.html',
  styleUrls: ['./listar-repuestos.component.css']
})

export class ListarRepuestosComponent implements OnInit {
  serviciosCatalogo = [
    { nombre: 'Servicio General', precio: 50 },
    { nombre: 'Mano de Obra Especializada', precio: 120 },
    { nombre: 'Diagnóstico', precio: 30 }
  ];
  // Solicitud de repuesto
  ordenTrabajoSolicitada: string = '';
  repuestoSolicitado: string = '';
  cantidadSolicitada: number | null = null;
  mensajeSolicitud: string = '';
      solicitarAsignacion(): void {
        if (!this.ordenTrabajoSolicitada.trim() || !this.repuestoSolicitado || !this.cantidadSolicitada || this.cantidadSolicitada < 1) {
          this.mensajeSolicitud = 'Completa todos los campos correctamente.';
          return;
        }
        // Simulación de solicitud
        this.mensajeSolicitud = `Solicitud enviada: ${this.cantidadSolicitada} repuesto(s) '${this.repuestoSolicitado}' para la orden '${this.ordenTrabajoSolicitada}'.`;
        setTimeout(() => this.mensajeSolicitud = '', 3000);
        this.ordenTrabajoSolicitada = '';
        this.repuestoSolicitado = '';
        this.cantidadSolicitada = null;
      }
    rolUsuario: string | null = null;
  repuestos: { nombre: string; descripcion: string; stock: number; precio: number }[] = [
    { nombre: 'Repuesto Demo', descripcion: 'Demo', stock: 10, precio: 25.5 },
    { nombre: 'Repuesto 2', descripcion: 'Otro demo', stock: 5, precio: 15 }
  ];
  repuestosFiltrados: { nombre: string; descripcion: string; stock: number; precio: number }[] = [];
  criterioBusqueda = '';
  mensajeExito = '';
  mensajeError = '';

  repuestoEditando: any = null;
  repuestoStockEditando: any = null;
  stockNuevo: number | null = null;
  tipoMovimiento: 'entrada' | 'salida' = 'entrada';
  precioNuevo: number | null = null;
  descripcionNueva: string = '';

  constructor(private router: Router, @Inject(AutenticacionServicio) private autenticacionServicio: AutenticacionServicio) {}

  ngOnInit(): void {
    this.aplicarFiltro();
    const usuario = this.autenticacionServicio.obtenerUsuarioActual();
    this.rolUsuario = usuario ? usuario.rol?.tipo || null : null;
  }

  aplicarFiltro(): void {
    if (!this.criterioBusqueda.trim()) {
      this.repuestosFiltrados = [...this.repuestos];
      return;
    }
    const criterio = this.criterioBusqueda.toLowerCase();
    this.repuestosFiltrados = this.repuestos.filter(r =>
      r.nombre.toLowerCase().includes(criterio) ||
      r.descripcion.toLowerCase().includes(criterio) ||
      r.precio.toString().includes(criterio)
    );
  }

  nuevoRepuesto(): void {
    this.router.navigate(['/inventario/registrar-repuesto']);
  }

  editarRepuesto(repuesto: any): void {
    this.repuestoEditando = { ...repuesto };
    this.precioNuevo = repuesto.precio;
    this.descripcionNueva = repuesto.descripcion;
  }

  guardarEdicion(): void {
    if (this.precioNuevo == null || this.precioNuevo <= 0 || !this.descripcionNueva.trim()) {
      this.mensajeError = 'Precio y descripción válidos requeridos.';
      return;
    }
    const repuesto = this.repuestos.find(r => r.nombre === this.repuestoEditando.nombre);
    if (repuesto) {
      repuesto.precio = this.precioNuevo;
      repuesto.descripcion = this.descripcionNueva;
      this.mensajeExito = 'Repuesto actualizado.';
      this.aplicarFiltro();
      setTimeout(() => this.mensajeExito = '', 2000);
    }
    this.repuestoEditando = null;
    this.mensajeError = '';
  }

  cancelarEdicion(): void {
    this.repuestoEditando = null;
    this.mensajeError = '';
  }

  actualizarStock(repuesto: any): void {
    this.repuestoStockEditando = repuesto;
    this.stockNuevo = null;
  }

  guardarStock(): void {
    if (this.stockNuevo == null || this.stockNuevo <= 0) {
      this.mensajeError = 'Ingrese una cantidad válida.';
      return;
    }
    const repuesto = this.repuestos.find(r => r.nombre === this.repuestoStockEditando.nombre);
    if (repuesto) {
      if (this.tipoMovimiento === 'entrada') {
        repuesto.stock += this.stockNuevo;
        this.mensajeExito = 'Stock incrementado.';
      } else {
        if (repuesto.stock - this.stockNuevo < 0) {
          this.mensajeError = 'No puede dejar el stock en negativo.';
          return;
        }
        repuesto.stock -= this.stockNuevo;
        this.mensajeExito = 'Stock reducido.';
      }
      this.aplicarFiltro();
      setTimeout(() => this.mensajeExito = '', 2000);
    }
    this.repuestoStockEditando = null;
    this.mensajeError = '';
    this.stockNuevo = null;
    this.tipoMovimiento = 'entrada';
  }

  cancelarStock(): void {
    this.repuestoStockEditando = null;
    this.mensajeError = '';
    this.stockNuevo = null;
  }

  eliminarRepuesto(repuesto: any): void {
    if (confirm('¿Eliminar repuesto ' + repuesto.nombre + '?')) {
      this.repuestos = this.repuestos.filter(r => r !== repuesto);
      this.aplicarFiltro();
      this.mensajeExito = 'Repuesto eliminado';
      setTimeout(() => this.mensajeExito = '', 2000);
    }
  }
}
