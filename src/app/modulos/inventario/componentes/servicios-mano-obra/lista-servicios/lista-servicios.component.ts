import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicioManoObraServicio } from '../../../servicios/servicio-mano-obra.servicio';
import { ServicioManoObra } from '../../../modelos/servicio.modelo';

@Component({
  selector: 'app-lista-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-servicios.component.html',
  styleUrl: './lista-servicios.component.css'
})
export class ListaServiciosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  servicios: ServicioManoObra[] = [];
  serviciosFiltrados: ServicioManoObra[] = [];
  criterioBusqueda = '';

  constructor(
    private serviciosServicio: ServicioManoObraServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.serviciosServicio.obtenerTodosLosServicios()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Ignoramos el estado "activo" porque queremos que sea una lista directa
        this.servicios = data;
        this.aplicarFiltros();
      });
  }

  aplicarFiltros(): void {
    if (this.criterioBusqueda.trim()) {
      const crit = this.criterioBusqueda.toLowerCase();
      this.serviciosFiltrados = this.servicios.filter(s => 
        s.nombre.toLowerCase().includes(crit) || 
        s.descripcion.toLowerCase().includes(crit)
      );
    } else {
      this.serviciosFiltrados = [...this.servicios];
    }
  }

  limpiarBusqueda(): void {
    this.criterioBusqueda = '';
    this.aplicarFiltros();
  }

  irANuevo(): void {
    this.router.navigate(['/inventario/registrar-servicio']);
  }

  irAEditar(id: string): void {
    // Esta ruta debe coincidir con la que pusimos en app.routes.ts
    this.router.navigate(['/inventario/servicios/editar', id]);
  }

  eliminarServicio(servicio: ServicioManoObra): void {
    if (confirm(`⚠️ ¿Estás seguro de ELIMINAR DEFINITIVAMENTE el servicio "${servicio.nombre}"?`)) {
      this.serviciosServicio.eliminarServicioDefinitivo(servicio.id).subscribe(() => {
        this.cargarServicios();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}