import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrdenTrabajo } from '../../modelos/orden.modelo';
import { OrdenServicio } from '../../servicios/orden.service';

@Component({
  selector: 'app-detalle-orden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-orden.component.html',
  styleUrl: './detalle-orden.component.css'
})
export class DetalleOrdenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ordenId: string = '';
  orden: OrdenTrabajo | null = null;
  mensajeError = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private ordenServicio: OrdenServicio
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.ordenId = params['id'];
        this.cargarOrden();
      }
    });
  }

  cargarOrden(): void {
    this.ordenServicio.obtenerOrdenPorId(this.ordenId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.orden = data;
        } else {
          this.mensajeError = 'La orden no existe o fue eliminada.';
        }
      });
  }

  imprimirComprobante(): void {
    // Activa el cuadro de diálogo de impresión del navegador
    window.print();
  }

  volver(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}