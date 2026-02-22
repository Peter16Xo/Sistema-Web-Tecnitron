/*
 * COMPONENTE: Editar Repuesto
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Formulario para editar un repuesto existente
 * Fecha: 2026
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-repuesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-repuesto.component.html',
  styleUrls: ['./editar-repuesto.component.css']
})
export class EditarRepuestoComponent {
  repuesto = {
    nombre: 'Repuesto Demo',
    descripcion: 'Descripción demo',
    cantidad: 10,
    precio: 25.5
  };

  mensajeExito = '';
  mensajeError = '';

  editar(): void {
    // Aquí va la lógica para editar el repuesto
    if (!this.repuesto.nombre.trim() || !this.repuesto.descripcion.trim() || this.repuesto.precio <= 0) {
      this.mensajeError = 'Todos los campos son obligatorios y deben ser válidos.';
      return;
    }
    this.mensajeExito = `Repuesto "${this.repuesto.nombre}" editado exitosamente.`;
    this.mensajeError = '';
  }
}
