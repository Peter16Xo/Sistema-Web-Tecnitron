import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { ClienteServicio } from '../../../clientes/servicios/cliente.servicio';
import { ServicioManoObraServicio } from '../../../inventario/servicios/servicio-mano-obra.servicio';
import { OrdenServicio } from '../../../ordenes/servicios/orden.service';

@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recepcionista-dashboard.component.html',
  styleUrls: ['./recepcionista-dashboard.component.css']
})
export class RecepcionistaDashboardComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  usuarioActual: Usuario | null = null;

  // Estadísticas dinámicas
  ordenesPendientes = 0; // Ahora será dinámico
  clientesRegistrados = 0;    
  serviciosDisponibles = 0;   

  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router,
    private clienteServicio: ClienteServicio,
    private serviciosServicio: ServicioManoObraServicio,
    private ordenServicio: OrdenServicio // INYECTADO
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarEstadisticasDinamicas();
  }

  private cargarEstadisticasDinamicas(): void {
    this.clienteServicio.clientes$.pipe(takeUntil(this.destroy$)).subscribe(clientes => {
        this.clientesRegistrados = clientes.filter(c => c.activo).length;
    });

    this.serviciosServicio.servicios$.pipe(takeUntil(this.destroy$)).subscribe(servicios => {
        this.serviciosDisponibles = servicios.filter(s => s.activo).length;
    });

    // NUEVO: Contar órdenes que NO estén entregadas
    this.ordenServicio.ordenes$.pipe(takeUntil(this.destroy$)).subscribe(ordenes => {
        this.ordenesPendientes = ordenes.filter(o => o.estado !== 'Entregado').length;
    });
  }

  private verificarAutenticacion(): void {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    if (!usuarioActual || usuarioActual.rol.tipo !== 'recepcionista') {
      this.router.navigate(['/dashboard']);
    } else {
      this.usuarioActual = usuarioActual;
    }
  }

  // Métodos de navegación rápida
  irARegistrarCliente() { this.router.navigate(['/clientes/nuevo'], { queryParams: { returnToList: 'true' } }); }
  irABuscarCliente() { this.router.navigate(['/clientes'], { queryParams: { buscar: 1 } }); }
  irACatalogoInventario() { this.router.navigate(['/inventario/listar-repuestos']); }
  
  // NUEVOS MÉTODOS DE ÓRDENES
  irANuevaOrden() { this.router.navigate(['/ordenes/nueva']); }
  irAListaOrdenes() { this.router.navigate(['/ordenes']); }

  cerrarSesion(): void {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
      this.autenticacionServicio.cerrarSesion();
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}