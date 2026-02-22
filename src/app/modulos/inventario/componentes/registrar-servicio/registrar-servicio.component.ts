/*
 * COMPONENTE: Registrar Servicio
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Formulario para registrar servicios de mano de obra
 * Fecha: 2026
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-servicio.component.html',
  styleUrls: ['./registrar-servicio.component.css']
})
export class RegistrarServicioComponent {
  servicio = {
    nombre: '',
    precio: 0
  };

  mensajeExito = '';
  mensajeError = '';

  registrar(): void {
    if (!this.servicio.nombre.trim() || this.servicio.precio <= 0) {
      this.mensajeError = 'Todos los campos son obligatorios y deben ser válidos.';
      return;
    }
    this.mensajeExito = `Servicio "${this.servicio.nombre}" registrado exitosamente.`;
    this.mensajeError = '';
    this.servicio = { nombre: '', precio: 0 };
  }
}
