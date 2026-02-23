/**
 * COMPONENTE: Formulario Repuesto
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Formulario unificado para Registrar, Editar y Actualizar Stock
 * Fecha: 2026
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RepuestoServicio } from '../../../servicios/repuesto.servicio';
import { Repuesto } from '../../../modelos/repuesto.modelo';

@Component({
  selector: 'app-formulario-repuesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-repuesto.component.html',
  styleUrl: './formulario-repuesto.component.css' /* ¡CRÍTICO PARA QUE LEA EL DISEÑO! */
})
export class FormularioRepuestoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  modo: string = 'nuevo';
  repuestoId: string | null = null;
  repuestoActual: Repuesto | null = null;

  formulario = { nombre: '', descripcion: '', stock: 0, precioUnitario: 0 };
  formularioStock = { tipoMovimiento: 'entrada', cantidad: 1 };

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private repuestoServicio: RepuestoServicio,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.repuestoId = params['id'];
      
      if (this.repuestoId === 'nuevo' || !this.repuestoId) {
        this.modo = 'nuevo';
      } else {
        this.modo = this.route.snapshot.queryParams['modo'] || 'editar';
        this.cargarRepuesto(this.repuestoId);
      }
    });
  }

  private cargarRepuesto(id: string): void {
    this.repuestoServicio.obtenerRepuestoPorId(id).pipe(takeUntil(this.destroy$)).subscribe(repuesto => {
        if (repuesto) {
          this.repuestoActual = repuesto;
          this.formulario = {
            nombre: repuesto.nombre, descripcion: repuesto.descripcion,
            stock: repuesto.stock, precioUnitario: repuesto.precioUnitario
          };
        } else {
          this.mensajeError = 'Repuesto no encontrado';
        }
      });
  }

  guardar(): void {
    this.mensajeError = ''; this.mensajeExito = '';

    if (this.modo === 'nuevo') {
      if (!this.formulario.nombre.trim() || !this.formulario.descripcion.trim() || this.formulario.precioUnitario <= 0 || this.formulario.stock < 0) {
        this.mensajeError = 'Todos los campos son obligatorios y deben ser válidos.';
        return;
      }
      
      const nuevo: Repuesto = {
        id: Date.now().toString(),
        nombre: this.formulario.nombre, descripcion: this.formulario.descripcion,
        stock: this.formulario.stock, precioUnitario: this.formulario.precioUnitario, activo: true
      };

      this.repuestoServicio.agregarRepuesto(nuevo).subscribe(() => {
        this.mensajeExito = `Repuesto registrado exitosamente.`;
        setTimeout(() => this.location.back(), 1500);
      });

    } else if (this.modo === 'editar' && this.repuestoActual) {
      if (!this.formulario.descripcion.trim() || this.formulario.precioUnitario <= 0) {
        this.mensajeError = 'La descripción y el precio son obligatorios.'; return;
      }
      const actualizado: Repuesto = { ...this.repuestoActual, descripcion: this.formulario.descripcion, precioUnitario: this.formulario.precioUnitario };
      this.repuestoServicio.actualizarRepuesto(actualizado).subscribe(() => {
        this.mensajeExito = `Repuesto actualizado exitosamente.`;
        setTimeout(() => this.location.back(), 1500);
      });

    } else if (this.modo === 'stock' && this.repuestoActual) {
      if (this.formularioStock.cantidad <= 0) {
        this.mensajeError = 'Ingrese una cantidad mayor a 0.'; return;
      }
      this.repuestoServicio.modificarStock(this.repuestoActual.id, this.formularioStock.cantidad, this.formularioStock.tipoMovimiento as 'entrada' | 'salida').subscribe(exito => {
        if (exito) {
          this.mensajeExito = `Stock actualizado correctamente.`;
          setTimeout(() => this.location.back(), 1500);
        } else {
          this.mensajeError = 'No hay suficiente stock para realizar la salida.';
        }
      });
    }
  }

  cancelar(): void { this.location.back(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}