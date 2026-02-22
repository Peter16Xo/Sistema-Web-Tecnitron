/**
 * COMPONENTE: Formulario Cliente
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Formulario para crear y editar clientes
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Cliente } from '../../modelos/cliente.modelo';

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.css']
})
export class FormularioClienteComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  esNuevo = true;
  clienteId: string | null = null;
  esRecepcionista = false;
  
  // NUEVO: Bandera para saber si vino directo del dashboard y forzar ida a la lista
  forzarRegresoALista = false;

  formularioCliente = {
    cedula: '', nombre: '', apellido: '', email: '', telefono: '',
    direccion: '', ciudad: '', provincia: '', codigoPostal: '', activo: true, notas: ''
  };

  mensajeExito = '';
  mensajeError = '';
  cargando = false;

  ciudades = ['Guayaquil', 'Quito', 'Cuenca', 'Ambato', 'Riobamba', 'Loja', 'Manta', 'Portoviejo', 'Santo Domingo', 'Otra'];
  provincias = ['Guayas', 'Pichincha', 'Azuay', 'Tungurahua', 'Chimborazo', 'Loja', 'Manabí', 'Santa Elena', 'Los Ríos', 'Cotopaxi'];

  constructor(
    private clienteServicio: ClienteServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    this.esRecepcionista = usuarioActual?.rol?.tipo === 'recepcionista';
    
    // Leemos el parámetro para saber de dónde vino
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.forzarRegresoALista = params['returnToList'] === 'true';
    });

    this.cargarCliente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
    }
  }

  private cargarCliente(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id'] && params['id'] !== 'nuevo') {
        this.esNuevo = false;
        this.clienteId = params['id'];
        this.clienteServicio.obtenerClientePorId(this.clienteId!)
          .pipe(takeUntil(this.destroy$))
          .subscribe((cliente: Cliente | null) => {
            if (cliente) {
              this.llenarFormulario(cliente);
            }
          });
      }
    });
  }

  private llenarFormulario(cliente: Cliente): void {
    this.formularioCliente = {
      cedula: cliente.cedula, nombre: cliente.nombre, apellido: cliente.apellido,
      email: cliente.email, telefono: cliente.telefono, direccion: cliente.direccion,
      ciudad: cliente.ciudad || '', provincia: cliente.provincia || '',
      codigoPostal: cliente.codigoPostal || '', activo: cliente.activo, notas: cliente.notas || ''
    };
  }

  private validarFormulario(): boolean {
    const regexNumeros = /^\d{10}$/; 

    if (!regexNumeros.test(this.formularioCliente.cedula)) {
      this.mensajeError = 'La cédula debe contener exactamente 10 dígitos numéricos';
      return false;
    }
    if (!this.formularioCliente.nombre.trim()) {
      this.mensajeError = 'El nombre es requerido';
      return false;
    }
    if (!this.formularioCliente.apellido.trim()) {
      this.mensajeError = 'El apellido es requerido';
      return false;
    }
    if (!this.validarEmail(this.formularioCliente.email)) {
      this.mensajeError = 'El email no es válido o está vacío';
      return false;
    }
    if (!regexNumeros.test(this.formularioCliente.telefono)) {
      this.mensajeError = 'El teléfono debe contener exactamente 10 dígitos numéricos';
      return false;
    }
    if (!this.formularioCliente.direccion.trim()) {
      this.mensajeError = 'La dirección es requerida';
      return false;
    }
    return true;
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private validarUnicidad(): Promise<boolean> {
    return new Promise((resolve) => {
      this.clienteServicio.validarCedulaUnica(this.formularioCliente.cedula, this.clienteId || undefined)
        .pipe(takeUntil(this.destroy$))
        .subscribe((cedulaValida: boolean) => {
          if (!cedulaValida) {
            this.mensajeError = 'Ya existe un cliente registrado con esta cédula';
            resolve(false); return;
          }

          this.clienteServicio.validarEmailUnico(this.formularioCliente.email, this.clienteId || undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe((emailValido: boolean) => {
              if (!emailValido) {
                this.mensajeError = 'Ya existe un cliente registrado con este correo electrónico';
                resolve(false); return;
              }

              this.clienteServicio.validarTelefonoUnico(this.formularioCliente.telefono, this.clienteId || undefined)
                .pipe(takeUntil(this.destroy$))
                .subscribe((telefonoValido: boolean) => {
                  if (!telefonoValido) {
                    this.mensajeError = 'Ya existe un cliente registrado con este número de teléfono';
                    resolve(false); return;
                  }
                  resolve(true);
                });
            });
        });
    });
  }

  /**
   * NUEVO: Lógica unificada para regresar respetando el historial
   */
  private finalizarYNavegar(): void {
    if (this.forzarRegresoALista) {
      // Reemplaza el formulario por la lista en el historial
      this.router.navigate(['/clientes'], { replaceUrl: true });
    } else {
      // Flujo normal (Administrador o navegaciones desde la lista)
      this.location.back();
    }
  }

  async guardarCliente(): Promise<void> {
    this.mensajeError = ''; this.mensajeExito = '';

    if (!this.validarFormulario()) return;
    
    const esValido = await this.validarUnicidad();
    if (!esValido) return;

    this.cargando = true;

    if (this.esNuevo) {
      const nuevoCliente: Cliente = {
        id: Date.now().toString(),
        cedula: this.formularioCliente.cedula, nombre: this.formularioCliente.nombre,
        apellido: this.formularioCliente.apellido, email: this.formularioCliente.email,
        telefono: this.formularioCliente.telefono, direccion: this.formularioCliente.direccion,
        ciudad: this.formularioCliente.ciudad || undefined, provincia: this.formularioCliente.provincia || undefined,
        codigoPostal: this.formularioCliente.codigoPostal || undefined, activo: true,
        fechaRegistro: new Date(), notas: this.formularioCliente.notas || undefined, numeroOrdenes: 0
      };

      this.clienteServicio.agregarCliente(nuevoCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe((exitoso: boolean) => {
          if (exitoso) {
            this.mensajeExito = `Cliente "${nuevoCliente.nombre}" creado exitosamente`;
            setTimeout(() => this.finalizarYNavegar(), 1500);
          }
          this.cargando = false;
        });
    } else {
      const clienteActualizado: Cliente = {
        id: this.clienteId!,
        cedula: this.formularioCliente.cedula, nombre: this.formularioCliente.nombre,
        apellido: this.formularioCliente.apellido, email: this.formularioCliente.email,
        telefono: this.formularioCliente.telefono, direccion: this.formularioCliente.direccion,
        ciudad: this.formularioCliente.ciudad || undefined, provincia: this.formularioCliente.provincia || undefined,
        codigoPostal: this.formularioCliente.codigoPostal || undefined, activo: this.formularioCliente.activo,
        fechaRegistro: new Date(), notas: this.formularioCliente.notas || undefined
      };

      this.clienteServicio.actualizarCliente(clienteActualizado)
        .pipe(takeUntil(this.destroy$))
        .subscribe((exitoso: boolean) => {
          if (exitoso) {
            this.mensajeExito = `Cliente "${clienteActualizado.nombre}" actualizado exitosamente`;
            setTimeout(() => this.finalizarYNavegar(), 1500);
          }
          this.cargando = false;
        });
    }
  }

  cancelar(): void {
    this.finalizarYNavegar();
  }
}