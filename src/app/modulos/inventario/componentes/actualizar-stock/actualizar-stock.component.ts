/*
 * COMPONENTE: Actualizar Stock
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Formulario para actualizar el stock de un repuesto
 * Fecha: 2026
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-actualizar-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actualizar-stock.component.html',
  styleUrls: ['./actualizar-stock.component.css']
})
export class ActualizarStockComponent {
  repuesto = {
    nombre: 'Repuesto Demo',
    cantidadActual: 10,
    cantidadAgregar: 0
  };

  mensajeExito = '';
  mensajeError = '';

  actualizar(): void {
    // Aquí va la lógica para actualizar el stock
    if (this.repuesto.cantidadAgregar <= 0) {
      this.mensajeError = 'La cantidad a agregar debe ser mayor a 0.';
      return;
    }
    this.repuesto.cantidadActual += this.repuesto.cantidadAgregar;
    this.mensajeExito = `Stock actualizado. Nuevo stock: ${this.repuesto.cantidadActual}`;
    this.mensajeError = '';
    this.repuesto.cantidadAgregar = 0;
  }
}
