/*
 * COMPONENTE: Inventario Dashboard
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Panel de control para Inventario, muestra funciones según el rol
 * Fecha: 2026
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';

@Component({
  selector: 'app-inventario-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventario-dashboard.component.html',
  styleUrls: ['./inventario-dashboard.component.css']
})
export class InventarioDashboardComponent implements OnInit {
  usuarioActual: any = null;

  constructor(private autenticacionServicio: AutenticacionServicio) {}

  ngOnInit(): void {
    this.usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
  }
}
