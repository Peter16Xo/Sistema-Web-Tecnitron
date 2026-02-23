import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../../servicios/autenticacion.servicio';
import { RepuestoServicio } from '../../../servicios/repuesto.servicio';
import { ServicioManoObraServicio } from '../../../servicios/servicio-mano-obra.servicio';
import { Repuesto } from '../../../modelos/repuesto.modelo';
import { ServicioManoObra } from '../../../modelos/servicio.modelo';

@Component({
  selector: 'app-lista-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-repuestos.component.html',
  styleUrl: './lista-repuestos.component.css'
})
export class ListaRepuestosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  rolUsuario: string | null = null;
  
  // Datos Repuestos
  todosLosRepuestos: Repuesto[] = [];
  repuestosFiltrados: Repuesto[] = [];
  criterioBusquedaRepuestos = '';
  
  // Datos Servicios
  serviciosCatalogo: ServicioManoObra[] = [];
  serviciosFiltrados: ServicioManoObra[] = [];
  criterioBusquedaServicios = '';

  // Filtros (Solo Admin)
  mostrarActivos = true;
  mostrarInactivos = false;
  repuestosActivos = 0;
  repuestosInactivos = 0;
  
  mensajeExito = '';

  // Solicitud Técnico
  ordenTrabajoSolicitada = '';
  repuestoSolicitado = '';
  cantidadSolicitada: number | null = null;

  constructor(
    private router: Router,
    private autenticacionServicio: AutenticacionServicio,
    private repuestoServicio: RepuestoServicio,
    private serviciosServicio: ServicioManoObraServicio
  ) {}

  ngOnInit(): void {
    const usuario = this.autenticacionServicio.obtenerUsuarioActual();
    this.rolUsuario = usuario ? usuario.rol?.tipo : null;
    
    // Si NO es admin, forzamos a que solo vea Activos siempre
    if (this.rolUsuario !== 'administrador') {
      this.mostrarInactivos = false;
    }

    this.cargarDatos();
  }

  private cargarDatos(): void {
    // Cargar Repuestos
    this.repuestoServicio.obtenerTodosLosRepuestos().pipe(takeUntil(this.destroy$)).subscribe(repuestos => {
        this.todosLosRepuestos = repuestos;
        this.actualizarContadores();
        this.aplicarFiltrosRepuestos();
      });

    // Cargar Servicios (Solo activos para la recepcionista)
    if (this.rolUsuario === 'recepcionista') {
      this.serviciosServicio.obtenerTodosLosServicios().pipe(takeUntil(this.destroy$)).subscribe(servicios => {
          this.serviciosCatalogo = servicios.filter(s => s.activo);
          this.serviciosFiltrados = [...this.serviciosCatalogo]; // Iniciar lista
        });
    }
  }

  private actualizarContadores(): void {
    this.repuestosActivos = this.todosLosRepuestos.filter(r => r.activo).length;
    this.repuestosInactivos = this.todosLosRepuestos.filter(r => !r.activo).length;
  }

  // --- LÓGICA DE REPUESTOS ---
  aplicarFiltrosRepuestos(): void {
    let resultado = [...this.todosLosRepuestos];
    
    resultado = resultado.filter(r => {
      if (this.mostrarActivos && r.activo) return true;
      if (this.mostrarInactivos && !r.activo) return true;
      return false;
    });

    if (this.criterioBusquedaRepuestos.trim()) {
      const crit = this.criterioBusquedaRepuestos.toLowerCase();
      resultado = resultado.filter(r => r.nombre.toLowerCase().includes(crit) || r.descripcion.toLowerCase().includes(crit));
    }
    this.repuestosFiltrados = resultado;
  }

  limpiarBusquedaRepuestos(): void { 
    this.criterioBusquedaRepuestos = ''; 
    if(this.rolUsuario === 'administrador') {
      this.mostrarActivos = true; 
      this.mostrarInactivos = false; 
    }
    this.aplicarFiltrosRepuestos(); 
  }

  alternarActivos(): void { this.mostrarActivos = !this.mostrarActivos; this.aplicarFiltrosRepuestos(); }
  alternarInactivos(): void { this.mostrarInactivos = !this.mostrarInactivos; this.aplicarFiltrosRepuestos(); }

  // --- LÓGICA DE SERVICIOS ---
  aplicarFiltrosServicios(): void {
    if (this.criterioBusquedaServicios.trim()) {
      const crit = this.criterioBusquedaServicios.toLowerCase();
      this.serviciosFiltrados = this.serviciosCatalogo.filter(s => 
        s.nombre.toLowerCase().includes(crit) || 
        s.descripcion.toLowerCase().includes(crit)
      );
    } else {
      this.serviciosFiltrados = [...this.serviciosCatalogo];
    }
  }

  limpiarBusquedaServicios(): void {
    this.criterioBusquedaServicios = '';
    this.aplicarFiltrosServicios();
  }

  // --- ACCIONES ---
  irANuevo(): void { this.router.navigate(['/inventario/repuestos/nuevo']); }
  irAEditar(id: string): void { this.router.navigate(['/inventario/repuestos/editar', id], { queryParams: { modo: 'editar' } }); }
  irAStock(id: string): void { this.router.navigate(['/inventario/repuestos/editar', id], { queryParams: { modo: 'stock' } }); }

  desactivarRepuesto(repuesto: Repuesto): void {
    if (confirm(`¿Estás seguro de desactivar el repuesto "${repuesto.nombre}"?`)) {
      this.repuestoServicio.desactivarRepuesto(repuesto.id).subscribe(() => this.cargarDatos());
    }
  }

  eliminarRepuestoFisico(repuesto: Repuesto): void {
    if (confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de ELIMINAR DEFINITIVAMENTE el repuesto "${repuesto.nombre}"?`)) {
      this.repuestoServicio.eliminarRepuestoDefinitivo(repuesto.id).subscribe(() => this.cargarDatos());
    }
  }

  solicitarAsignacion(): void {
    if (!this.ordenTrabajoSolicitada || !this.repuestoSolicitado || !this.cantidadSolicitada) {
      alert('Completa todos los campos para la solicitud.'); return;
    }
    this.mensajeExito = `Se solicitaron ${this.cantidadSolicitada} unid. de '${this.repuestoSolicitado}' para la Orden '${this.ordenTrabajoSolicitada}'.`;
    setTimeout(() => this.mensajeExito = '', 4000);
    this.ordenTrabajoSolicitada = ''; this.repuestoSolicitado = ''; this.cantidadSolicitada = null;
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}