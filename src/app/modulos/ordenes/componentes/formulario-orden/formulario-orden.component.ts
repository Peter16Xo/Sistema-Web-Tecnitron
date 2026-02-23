import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ClienteServicio } from '../../../clientes/servicios/cliente.servicio';
import { Cliente } from '../../../clientes/modelos/cliente.modelo';
import { OrdenTrabajo } from '../../modelos/orden.modelo';
import { OrdenServicio } from '../../servicios/orden.service';

@Component({
  selector: 'app-formulario-orden',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-orden.component.html',
  styleUrl: './formulario-orden.component.css'
})
export class FormularioOrdenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  clientes: Cliente[] = [];
  
  // Objeto del formulario
  formulario = {
    clienteId: '',
    equipo: {
      tipo: '',
      marca: '',
      modelo: '',
      serie: ''
    },
    diagnostico: {
      fallaReportada: '',
      accesoriosRecibidos: ''
    }
  };

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private ordenServicio: OrdenServicio,
    private clienteServicio: ClienteServicio,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    // Cargamos solo los clientes activos para que la recepcionista pueda seleccionarlos
    this.clienteServicio.obtenerClientesActivos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.clientes = data);
  }

  guardar(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validaciones básicas
    if (!this.formulario.clienteId) {
      this.mensajeError = 'Debes seleccionar un cliente asociado a la orden.';
      return;
    }
    if (!this.formulario.equipo.tipo || !this.formulario.equipo.marca || !this.formulario.equipo.modelo) {
      this.mensajeError = 'Los datos básicos del equipo (Tipo, Marca, Modelo) son obligatorios.';
      return;
    }
    if (!this.formulario.diagnostico.fallaReportada) {
      this.mensajeError = 'Debes ingresar la falla reportada por el cliente.';
      return;
    }

    // Buscamos los datos del cliente seleccionado para guardarlos en la orden
    const clienteSeleccionado = this.clientes.find(c => c.id === this.formulario.clienteId);

    const nuevaOrden: Partial<OrdenTrabajo> = {
      clienteId: this.formulario.clienteId,
      clienteNombre: clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : 'Cliente Desconocido',
      clienteCedula: clienteSeleccionado ? clienteSeleccionado.cedula : '',
      equipo: { ...this.formulario.equipo },
      diagnostico: { ...this.formulario.diagnostico }
    };

    this.ordenServicio.crearOrden(nuevaOrden).subscribe((ordenCreada) => {
      this.mensajeExito = `Orden ${ordenCreada.codigo} creada exitosamente.`;
      setTimeout(() => this.router.navigate(['/ordenes']), 2000);
    });
  }

  cancelar(): void {
    this.location.back();
  }

  irANuevoCliente(): void {
    // Si el cliente no existe, la recepcionista puede ir a crearlo y luego volver
    this.router.navigate(['/clientes/nuevo']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}