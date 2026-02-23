import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdenTrabajo } from '../../modelos/orden.modelo';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { OrdenServicio } from '../../servicios/orden.service';

@Component({
  selector: 'app-lista-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-ordenes.component.html',
  styleUrl: './lista-ordenes.component.css'
})
export class ListaOrdenesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ordenes: OrdenTrabajo[] = [];
  ordenesFiltradas: OrdenTrabajo[] = [];
  
  criterioBusqueda = '';
  filtroEstado = ''; // NUEVO: Filtro desplegable
  rolUsuario: string = '';

  constructor(
    private ordenServicio: OrdenServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.autenticacionServicio.obtenerUsuarioActual();
    this.rolUsuario = usuario?.rol.tipo || '';
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.ordenServicio.obtenerTodasLasOrdenes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.ordenes = data;
        this.aplicarFiltros();
      });
  }

  aplicarFiltros(): void {
    let resultado = [...this.ordenes];

    // Regla de Negocio: El Técnico NO ve las órdenes canceladas
    if (this.rolUsuario === 'tecnico') {
      resultado = resultado.filter(o => o.estado !== 'Cancelado');
    }

    // Aplicar Filtro por Estado (Desplegable)
    if (this.filtroEstado) {
      resultado = resultado.filter(o => o.estado === this.filtroEstado);
    }

    // Aplicar Búsqueda de Texto
    if (this.criterioBusqueda.trim()) {
      const busqueda = this.criterioBusqueda.toLowerCase();
      resultado = resultado.filter(o => 
        o.codigo.toLowerCase().includes(busqueda) || 
        (o.clienteCedula && o.clienteCedula.includes(busqueda)) ||
        (o.clienteNombre && o.clienteNombre.toLowerCase().includes(busqueda)) ||
        o.equipo.marca.toLowerCase().includes(busqueda)
      );
    }

    this.ordenesFiltradas = resultado;
  }

  limpiarBusqueda(): void {
    this.criterioBusqueda = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  // FLUJO DE APROBACIÓN (Solo Recepcionista/Admin)
  aprobarPresupuesto(orden: OrdenTrabajo, aprobado: boolean): void {
    const nuevoEstado = aprobado ? 'En Reparación' : 'Cancelado';
    const accion = aprobado ? 'Aceptar y empezar reparación' : 'Rechazar y cancelar orden';
    
    if (confirm(`¿Estás seguro de ${accion} para la orden ${orden.codigo}?`)) {
      this.ordenServicio.cambiarEstado(orden.id, nuevoEstado).subscribe(() => {
        this.cargarOrdenes();
      });
    }
  }
  // Exclusivo para entregar el equipo al cliente
  entregarEquipo(orden: OrdenTrabajo): void {
    if (confirm(`¿Estás seguro de marcar la orden ${orden.codigo} como ENTREGADA al cliente?`)) {
      this.ordenServicio.cambiarEstado(orden.id, 'Entregado').subscribe(() => {
        this.cargarOrdenes();
      });
    }
  }

  // Navegación
  irANuevaOrden(): void { this.router.navigate(['/ordenes/nueva']); }
  irADetalle(id: string): void { this.router.navigate(['/ordenes/detalle', id]); }
  irADiagnostico(id: string): void { this.router.navigate(['/ordenes/diagnostico', id]); }

  // Estilos visuales
  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'Recibido': return 'estado-recibido';
      case 'Diagnóstico': return 'estado-diagnostico';
      case 'En Reparación': return 'estado-reparacion';
      case 'Listo': return 'estado-listo';
      case 'Entregado': return 'estado-entregado';
      case 'Cancelado': return 'estado-cancelado';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}