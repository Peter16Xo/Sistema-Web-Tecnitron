import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicioManoObraServicio } from '../../../servicios/servicio-mano-obra.servicio';
import { ServicioManoObra } from '../../../modelos/servicio.modelo';

@Component({
  selector: 'app-formulario-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-servicio.component.html',
  styleUrl: './formulario-servicio.component.css'
})
export class FormularioServicioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  esNuevo = true;
  servicioId: string | null = null;
  servicioActual: ServicioManoObra | null = null;

  formulario = { nombre: '', descripcion: '', precioBase: 0 };
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private servicioManoObra: ServicioManoObraServicio,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Escucha la URL para saber si hay un ID (Modo Editar)
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id'] && params['id'] !== 'nuevo') {
        this.esNuevo = false;
        this.servicioId = params['id'];
        this.cargarServicio();
      }
    });
  }

  cargarServicio(): void {
    this.servicioManoObra.obtenerServicioPorId(this.servicioId!).pipe(takeUntil(this.destroy$)).subscribe(servicio => {
      if (servicio) {
        this.servicioActual = servicio;
        this.formulario = {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precioBase: servicio.precioBase
        };
      } else {
        this.mensajeError = 'Servicio no encontrado.';
      }
    });
  }

  guardar(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.formulario.nombre.trim() || this.formulario.precioBase <= 0) {
      this.mensajeError = 'El nombre y el precio base son obligatorios.';
      return;
    }

    if (this.esNuevo) {
      const nuevo: ServicioManoObra = {
        id: Date.now().toString(),
        nombre: this.formulario.nombre,
        descripcion: this.formulario.descripcion,
        precioBase: this.formulario.precioBase,
        activo: true
      };

      this.servicioManoObra.agregarServicio(nuevo).subscribe(() => {
        this.mensajeExito = 'Servicio registrado exitosamente.';
        setTimeout(() => this.location.back(), 1500);
      });
    } else if (this.servicioActual) {
      const actualizado: ServicioManoObra = {
        ...this.servicioActual,
        nombre: this.formulario.nombre,
        descripcion: this.formulario.descripcion,
        precioBase: this.formulario.precioBase
      };

      this.servicioManoObra.actualizarServicio(actualizado).subscribe(() => {
        this.mensajeExito = 'Servicio actualizado exitosamente.';
        setTimeout(() => this.location.back(), 1500);
      });
    }
  }

  cancelar(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}