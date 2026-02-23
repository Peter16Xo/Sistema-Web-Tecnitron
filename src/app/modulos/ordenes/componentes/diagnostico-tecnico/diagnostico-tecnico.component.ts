// Reemplaza las importaciones superiores y añade AutenticacionServicio
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { OrdenTrabajo, ItemOrden, EstadoOrden } from '../../modelos/orden.modelo';
import { RepuestoServicio } from '../../../inventario/servicios/repuesto.servicio';
import { ServicioManoObraServicio } from '../../../inventario/servicios/servicio-mano-obra.servicio';
import { Repuesto } from '../../../inventario/modelos/repuesto.modelo';
import { ServicioManoObra } from '../../../inventario/modelos/servicio.modelo';
import { OrdenServicio } from '../../servicios/orden.service';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';


@Component({
  selector: 'app-diagnostico-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diagnostico-tecnico.component.html',
  styleUrl: './diagnostico-tecnico.component.css'
})
export class DiagnosticoTecnicoComponent implements OnInit, OnDestroy {
  // ... mantén tus variables igual ...
  private destroy$ = new Subject<void>();
  ordenId: string = '';
  ordenActual: OrdenTrabajo | null = null;
  repuestosDisponibles: Repuesto[] = [];
  serviciosDisponibles: ServicioManoObra[] = [];
  tipoItemSeleccionado: 'repuesto' | 'servicio' = 'repuesto';
  itemSeleccionadoId: string = '';
  cantidadItem: number = 1;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private ordenServicio: OrdenServicio,
    private repuestoServicio: RepuestoServicio,
    private servicioManoObra: ServicioManoObraServicio,
    private autenticacionServicio: AutenticacionServicio // INYECTADO AQUÍ
  ) {}

  // ... mantén ngOnInit, cargarOrden, cargarCatalogos, agregarItem, eliminarItem y volver EXACTAMENTE IGUAL ...
  
  // COPIA ESTOS MÉTODOS DE ABAJO PARA REEMPLAZAR TUS VERSIONES ANTERIORES:

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.ordenId = params['id'];
        this.cargarOrden();
      }
    });
    this.cargarCatalogos();
  }

  cargarOrden(): void {
    this.ordenServicio.obtenerOrdenPorId(this.ordenId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(orden => {
        if (orden) this.ordenActual = orden;
        else this.mensajeError = 'No se encontró la orden especificada.';
      });
  }

  cargarCatalogos(): void {
    this.repuestoServicio.obtenerTodosLosRepuestos().pipe(takeUntil(this.destroy$)).subscribe(data => this.repuestosDisponibles = data.filter(r => r.activo && r.stock > 0));
    this.servicioManoObra.obtenerTodosLosServicios().pipe(takeUntil(this.destroy$)).subscribe(data => this.serviciosDisponibles = data.filter(s => s.activo));
  }

  guardarDiagnostico(): void {
    if (this.ordenActual) {
      this.ordenServicio.actualizarOrden(this.ordenActual).subscribe(() => {
        this.mostrarExito('Informe técnico actualizado correctamente.');
      });
    }
  }

  agregarItem(): void {
    if (!this.itemSeleccionadoId || this.cantidadItem < 1 || !this.ordenActual) return;

    let nombreItem = ''; let precio = 0;
    if (this.tipoItemSeleccionado === 'repuesto') {
      const repuesto = this.repuestosDisponibles.find(r => r.id === this.itemSeleccionadoId);
      if (repuesto) {
        if (this.cantidadItem > repuesto.stock) { this.mensajeError = `Stock insuficiente.`; return; }
        nombreItem = repuesto.nombre; precio = repuesto.precioUnitario;
      }
    } else {
      const servicio = this.serviciosDisponibles.find(s => s.id === this.itemSeleccionadoId);
      if (servicio) { nombreItem = servicio.nombre; precio = servicio.precioBase; }
    }

    const nuevoItem: ItemOrden = { tipo: this.tipoItemSeleccionado, itemId: this.itemSeleccionadoId, nombre: nombreItem, cantidad: this.cantidadItem, precioUnitario: precio, subtotal: precio * this.cantidadItem };
    this.ordenActual.items.push(nuevoItem);
    this.ordenServicio.actualizarOrden(this.ordenActual).subscribe(() => {
      this.cargarOrden();
      this.mostrarExito(`Se agregó "${nombreItem}" a la orden.`);
      this.itemSeleccionadoId = ''; this.cantidadItem = 1;
    });
  }

  eliminarItem(index: number): void {
    if (this.ordenActual && confirm('¿Quitar este ítem de la orden?')) {
      this.ordenActual.items.splice(index, 1);
      this.ordenServicio.actualizarOrden(this.ordenActual).subscribe(() => this.cargarOrden());
    }
  }

  // MÉTODO ACTUALIZADO: Asignación de técnico automática y redirección al marcar Listo
  cambiarEstado(nuevoEstado: EstadoOrden): void {
    if (confirm(`¿Mover la orden a estado: ${nuevoEstado}?`)) {
      
      // Si el técnico inicia el diagnóstico, registramos su nombre
      if (this.ordenActual && this.ordenActual.estado === 'Recibido' && nuevoEstado === 'Diagnóstico') {
        const usuarioLogeado = this.autenticacionServicio.obtenerUsuarioActual();
        if (usuarioLogeado) {
          this.ordenActual.tecnicoId = usuarioLogeado.id;
          this.ordenActual.tecnicoNombre = `${usuarioLogeado.nombre} ${usuarioLogeado.apellido}`;
          this.ordenServicio.actualizarOrden(this.ordenActual).subscribe(); // Guardamos el nombre en DB
        }
      }

      this.ordenServicio.cambiarEstado(this.ordenId, nuevoEstado).subscribe(() => {
        this.cargarOrden();
        this.mostrarExito(`La orden ahora está: ${nuevoEstado}`);
        
        // Si ya terminó, lo regresamos a la lista automáticamente
        if (nuevoEstado === 'Listo') {
          setTimeout(() => this.volver(), 1500);
        }
      });
    }
  }

  mostrarExito(mensaje: string): void { this.mensajeError = ''; this.mensajeExito = mensaje; setTimeout(() => this.mensajeExito = '', 3000); }
  volver(): void { this.location.back(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}