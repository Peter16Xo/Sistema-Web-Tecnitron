/*
 * COMPONENTE: Buscar Repuesto
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Formulario para buscar repuestos por nombre o descripción
 * Fecha: 2026
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscar-repuesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-repuesto.component.html',
  styleUrls: ['./buscar-repuesto.component.css']
})
export class BuscarRepuestoComponent {
  criterio = '';
  resultados = [
    // Demo
    { nombre: 'Repuesto Demo', descripcion: 'Demo', stock: 10, precio: 25.5 }
  ];

  buscar(): void {
    // Aquí va la lógica real de búsqueda
    // Por ahora, filtra demo
    this.resultados = this.resultados.filter(r =>
      r.nombre.toLowerCase().includes(this.criterio.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(this.criterio.toLowerCase())
    );
  }
}
