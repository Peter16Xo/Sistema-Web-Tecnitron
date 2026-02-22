/*
 * COMPONENTE: Eliminar Repuesto
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Formulario para eliminar o inactivar un repuesto
 * Fecha: 2026
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eliminar-repuesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eliminar-repuesto.component.html',
  styleUrls: ['./eliminar-repuesto.component.css']
})
export class EliminarRepuestoComponent {
  repuesto = {
    nombre: '',
    motivo: ''
  };

  mensajeExito = '';
  mensajeError = '';

  eliminar(): void {
    if (!this.repuesto.nombre.trim() || !this.repuesto.motivo.trim()) {
      this.mensajeError = 'Debe indicar el nombre y motivo de eliminación.';
      return;
    }
    this.mensajeExito = `Repuesto "${this.repuesto.nombre}" eliminado/inactivado.`;
    this.mensajeError = '';
    this.repuesto = { nombre: '', motivo: '' };
  }
}
