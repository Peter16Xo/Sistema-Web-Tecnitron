/*
 * COMPONENTE: Registrar Repuesto
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Formulario para registrar un nuevo repuesto en el catálogo
 * Fecha: 2026
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-repuesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-repuesto.component.html',
  styleUrls: ['./registrar-repuesto.component.css']
})
export class RegistrarRepuestoComponent {
  repuesto = {
    nombre: '',
    descripcion: '',
    cantidad: 0,
    precio: 0
  };

  mensajeExito = '';
  mensajeError = '';

  registrar(): void {
    // Aquí va la lógica para registrar el repuesto
    if (!this.repuesto.nombre.trim() || !this.repuesto.descripcion.trim() || this.repuesto.cantidad <= 0 || this.repuesto.precio <= 0) {
      this.mensajeError = 'Todos los campos son obligatorios y deben ser válidos.';
      return;
    }
    this.mensajeExito = `Repuesto "${this.repuesto.nombre}" registrado exitosamente.`;
    this.mensajeError = '';
    // Resetear formulario
    this.repuesto = { nombre: '', descripcion: '', cantidad: 0, precio: 0 };
  }
}
