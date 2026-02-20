/**
 * COMPONENTE: Formulario Cliente
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Formulario para crear y editar clientes
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  // Control de lifecycle
  private destroy$ = new Subject<void>();

  // Control de modo (nuevo/editar)
  esNuevo = true;
  clienteId: string | null = null;

  // Datos del cliente
  formularioCliente = {
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    activo: true,
    notas: ''
  };

  // Mensajes
  mensajeExito = '';
  mensajeError = '';
  cargando = false;

  // Ciudades para dropdown
  ciudades = [
    'Guayaquil',
    'Quito',
    'Cuenca',
    'Ambato',
    'Riobamba',
    'Loja',
    'Manta',
    'Portoviejo',
    'Santo Domingo',
    'Otra'
  ];

  provincias = [
    'Guayas',
    'Pichincha',
    'Azuay',
    'Tungurahua',
    'Chimborazo',
    'Loja',
    'Manabí',
    'Santa Elena',
    'Los Ríos',
    'Cotopaxi'
  ];

  constructor(
    private clienteServicio: ClienteServicio,
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarCliente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Verifica autenticación
   */
  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Carga datos del cliente si está en modo edición
   */
  private cargarCliente(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id'] && params['id'] !== 'nuevo') {
        this.esNuevo = false;
        this.clienteId = params['id'];
        this.clienteServicio.obtenerClientePorId(this.clienteId!)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (cliente: Cliente | null) => {
              if (cliente) {
                this.llenarFormulario(cliente);
              }
            }
          );
      }
    });
  }

  /**
   * Llena el formulario con datos del cliente
   */
  private llenarFormulario(cliente: Cliente): void {
    this.formularioCliente = {
      cedula: cliente.cedula,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad || '',
      provincia: cliente.provincia || '',
      codigoPostal: cliente.codigoPostal || '',
      activo: cliente.activo,
      notas: cliente.notas || ''
    };
  }

  /**
   * Valida el formulario
   */
  private validarFormulario(): boolean {
    if (!this.formularioCliente.cedula.trim()) {
      this.mensajeError = 'La cédula es requerida';
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
    if (!this.formularioCliente.email.trim()) {
      this.mensajeError = 'El email es requerido';
      return false;
    }
    if (!this.validarEmail(this.formularioCliente.email)) {
      this.mensajeError = 'El email no es válido';
      return false;
    }
    if (!this.formularioCliente.telefono.trim()) {
      this.mensajeError = 'El teléfono es requerido';
      return false;
    }
    if (!this.formularioCliente.direccion.trim()) {
      this.mensajeError = 'La dirección es requerida';
      return false;
    }
    return true;
  }

  /**
   * Valida formato de email
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida cedula y email únicos antes de guardar
   */
  private validarUnicidad(): Promise<boolean> {
    return new Promise((resolve) => {
      // Validar cédula única
      this.clienteServicio.validarCedulaUnica(this.formularioCliente.cedula, this.clienteId || undefined)
        .pipe(takeUntil(this.destroy$))
        .subscribe((cedulaValida: boolean) => {
          if (!cedulaValida) {
            this.mensajeError = 'Ya existe un cliente registrado con esta cédula';
            resolve(false);
            return;
          }

          // Validar email único
          this.clienteServicio.validarEmailUnico(this.formularioCliente.email, this.clienteId || undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe((emailValido: boolean) => {
              if (!emailValido) {
                this.mensajeError = 'Ya existe un cliente registrado con este correo electrónico';
                resolve(false);
                return;
              }
              resolve(true);
            });
        });
    });
  }

  /**
   * Guarda el cliente
   */
  async guardarCliente(): Promise<void> {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.validarFormulario()) {
      return;
    }

    // Validar unicidad de cedula y email
    const esValido = await this.validarUnicidad();
    if (!esValido) {
      return;
    }

    this.cargando = true;

    if (this.esNuevo) {
      // Crear nuevo cliente
      const nuevoCliente: Cliente = {
        id: Date.now().toString(),
        cedula: this.formularioCliente.cedula,
        nombre: this.formularioCliente.nombre,
        apellido: this.formularioCliente.apellido,
        email: this.formularioCliente.email,
        telefono: this.formularioCliente.telefono,
        direccion: this.formularioCliente.direccion,
        ciudad: this.formularioCliente.ciudad || undefined,
        provincia: this.formularioCliente.provincia || undefined,
        codigoPostal: this.formularioCliente.codigoPostal || undefined,
        activo: true,
        fechaRegistro: new Date(),
        notas: this.formularioCliente.notas || undefined,
        numeroOrdenes: 0
      };

      this.clienteServicio.agregarCliente(nuevoCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (exitoso: boolean) => {
            if (exitoso) {
              this.mensajeExito = `Cliente "${nuevoCliente.nombre}" creado exitosamente`;
              setTimeout(() => {
                this.router.navigate(['/clientes']);
              }, 1500);
            }
            this.cargando = false;
          }
        );
    } else {
      // Actualizar cliente existente
      const clienteActualizado: Cliente = {
        id: this.clienteId!,
        cedula: this.formularioCliente.cedula,
        nombre: this.formularioCliente.nombre,
        apellido: this.formularioCliente.apellido,
        email: this.formularioCliente.email,
        telefono: this.formularioCliente.telefono,
        direccion: this.formularioCliente.direccion,
        ciudad: this.formularioCliente.ciudad || undefined,
        provincia: this.formularioCliente.provincia || undefined,
        codigoPostal: this.formularioCliente.codigoPostal || undefined,
        activo: this.formularioCliente.activo,
        fechaRegistro: new Date(),
        notas: this.formularioCliente.notas || undefined
      };

      this.clienteServicio.actualizarCliente(clienteActualizado)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (exitoso: boolean) => {
            if (exitoso) {
              this.mensajeExito = `Cliente "${clienteActualizado.nombre}" actualizado exitosamente`;
              setTimeout(() => {
                this.router.navigate(['/clientes']);
              }, 1500);
            }
            this.cargando = false;
          }
        );
    }
  }

  /**
   * Cancela y regresa a la lista
   */
  cancelar(): void {
    this.router.navigate(['/clientes']);
  }
}
