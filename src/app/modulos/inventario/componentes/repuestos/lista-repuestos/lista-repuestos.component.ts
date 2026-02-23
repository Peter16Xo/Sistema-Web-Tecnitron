import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../../servicios/autenticacion.servicio';
import { RepuestoServicio } from '../../../servicios/repuesto.servicio';
import { ServicioManoObraServicio } from '../../../servicios/servicio-mano-obra.servicio';
import { Repuesto } from '../../../modelos/repuesto.modelo';
import { ServicioManoObra } from '../../../modelos/servicio.modelo';

@Component({
  selector: 'app-lista-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-repuestos.component.html',
  styleUrl: './lista-repuestos.component.css'
})
export class ListaRepuestosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  rolUsuario: string | null = null;
  
  // Datos Repuestos
  todosLosRepuestos: Repuesto[] = [];
  repuestosFiltrados: Repuesto[] = [];
  repuestosSinStock: Repuesto[] = []; // NUEVO: Para el select del técnico
  criterioBusquedaRepuestos = '';
  
  // Datos Servicios
  serviciosCatalogo: ServicioManoObra[] = [];
  serviciosFiltrados: ServicioManoObra[] = [];
  criterioBusquedaServicios = '';

  // Filtros (Solo Admin)
  mostrarActivos = true;
  mostrarInactivos = false;
  repuestosActivos = 0;
  repuestosInactivos = 0;
  
  mensajeExito = '';

  // NUEVO: Variables para la Solicitud de Repuestos
  repuestoSolicitado = '';
  otroRepuesto = ''; // Cuando selecciona "OTROS"
  cantidadSolicitada: number | null = null;
  
  // NUEVO: Bandeja del Administrador
  solicitudesRepuestos: any[] = [];
  verBandejaSolicitudes = false;

  constructor(
    private router: Router,
    private autenticacionServicio: AutenticacionServicio,
    private repuestoServicio: RepuestoServicio,
    private serviciosServicio: ServicioManoObraServicio
  ) {}

  ngOnInit(): void {
    const usuario = this.autenticacionServicio.obtenerUsuarioActual();
    this.rolUsuario = usuario ? usuario.rol?.tipo : null;
    
    if (this.rolUsuario !== 'administrador') {
      this.mostrarInactivos = false;
    }

    this.cargarDatos();
    
    // Cargamos las solicitudes guardadas (Simulación de DB con LocalStorage)
    if (this.rolUsuario === 'administrador' || this.rolUsuario === 'tecnico') {
      this.cargarSolicitudes();
    }
  }

  private cargarDatos(): void {
    this.repuestoServicio.obtenerTodosLosRepuestos().pipe(takeUntil(this.destroy$)).subscribe(repuestos => {
        this.todosLosRepuestos = repuestos;
        this.actualizarContadores();
        this.aplicarFiltrosRepuestos();
        
        // Extraemos solo los que están en Stock 0 para el select del Técnico
        this.repuestosSinStock = repuestos.filter(r => r.stock === 0 && r.activo);
      });

    if (this.rolUsuario === 'recepcionista') {
      this.serviciosServicio.obtenerTodosLosServicios().pipe(takeUntil(this.destroy$)).subscribe(servicios => {
          this.serviciosCatalogo = servicios.filter(s => s.activo);
          this.serviciosFiltrados = [...this.serviciosCatalogo];
        });
    }
  }

  private actualizarContadores(): void {
    this.repuestosActivos = this.todosLosRepuestos.filter(r => r.activo).length;
    this.repuestosInactivos = this.todosLosRepuestos.filter(r => !r.activo).length;
  }

  aplicarFiltrosRepuestos(): void {
    let resultado = [...this.todosLosRepuestos];
    resultado = resultado.filter(r => {
      if (this.mostrarActivos && r.activo) return true;
      if (this.mostrarInactivos && !r.activo) return true;
      return false;
    });
    if (this.criterioBusquedaRepuestos.trim()) {
      const crit = this.criterioBusquedaRepuestos.toLowerCase();
      resultado = resultado.filter(r => r.nombre.toLowerCase().includes(crit) || r.descripcion.toLowerCase().includes(crit));
    }
    this.repuestosFiltrados = resultado;
  }

  limpiarBusquedaRepuestos(): void { 
    this.criterioBusquedaRepuestos = ''; 
    if(this.rolUsuario === 'administrador') { this.mostrarActivos = true; this.mostrarInactivos = false; }
    this.aplicarFiltrosRepuestos(); 
  }
  alternarActivos(): void { this.mostrarActivos = !this.mostrarActivos; this.aplicarFiltrosRepuestos(); }
  alternarInactivos(): void { this.mostrarInactivos = !this.mostrarInactivos; this.aplicarFiltrosRepuestos(); }

  aplicarFiltrosServicios(): void {
    if (this.criterioBusquedaServicios.trim()) {
      const crit = this.criterioBusquedaServicios.toLowerCase();
      this.serviciosFiltrados = this.serviciosCatalogo.filter(s => s.nombre.toLowerCase().includes(crit) || s.descripcion.toLowerCase().includes(crit));
    } else {
      this.serviciosFiltrados = [...this.serviciosCatalogo];
    }
  }
  limpiarBusquedaServicios(): void { this.criterioBusquedaServicios = ''; this.aplicarFiltrosServicios(); }

  irANuevo(): void { this.router.navigate(['/inventario/repuestos/nuevo']); }
  irAEditar(id: string): void { this.router.navigate(['/inventario/repuestos/editar', id], { queryParams: { modo: 'editar' } }); }
  irAStock(id: string): void { this.router.navigate(['/inventario/repuestos/editar', id], { queryParams: { modo: 'stock' } }); }

  desactivarRepuesto(repuesto: Repuesto): void {
    if (confirm(`¿Estás seguro de desactivar el repuesto "${repuesto.nombre}"?`)) {
      this.repuestoServicio.desactivarRepuesto(repuesto.id).subscribe(() => this.cargarDatos());
    }
  }

  eliminarRepuestoFisico(repuesto: Repuesto): void {
    if (confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de ELIMINAR DEFINITIVAMENTE el repuesto "${repuesto.nombre}"?`)) {
      this.repuestoServicio.eliminarRepuestoDefinitivo(repuesto.id).subscribe(() => this.cargarDatos());
    }
  }

  // ==========================================
  // LÓGICA DE SOLICITUDES DE REPUESTOS
  // ==========================================
  
  cargarSolicitudes(): void {
    const data = localStorage.getItem('tecnitron_solicitudes_repuestos');
    this.solicitudesRepuestos = data ? JSON.parse(data) : [];
  }

  solicitarRepuesto(): void {
    if (!this.repuestoSolicitado || !this.cantidadSolicitada) return;
    if (this.repuestoSolicitado === 'OTROS' && !this.otroRepuesto.trim()) return;

    // Determinar nombre real
    const nombreFinal = this.repuestoSolicitado === 'OTROS' ? this.otroRepuesto : this.repuestoSolicitado;
    const usuario = this.autenticacionServicio.obtenerUsuarioActual();

    const nuevaSolicitud = {
      id: Date.now().toString(),
      repuesto: nombreFinal,
      cantidad: this.cantidadSolicitada,
      solicitante: `${usuario?.nombre} ${usuario?.apellido}`,
      rol: usuario?.rol?.nombre || 'Técnico',
      fecha: new Date()
    };

    this.solicitudesRepuestos.push(nuevaSolicitud);
    localStorage.setItem('tecnitron_solicitudes_repuestos', JSON.stringify(this.solicitudesRepuestos));

    this.mensajeExito = `Solicitud de ${this.cantidadSolicitada} unid. de '${nombreFinal}' enviada al administrador.`;
    setTimeout(() => this.mensajeExito = '', 5000);
    
    // Limpiar formulario
    this.repuestoSolicitado = '';
    this.otroRepuesto = '';
    this.cantidadSolicitada = null;
  }

  marcarRevisado(id: string): void {
    this.solicitudesRepuestos = this.solicitudesRepuestos.filter(s => s.id !== id);
    localStorage.setItem('tecnitron_solicitudes_repuestos', JSON.stringify(this.solicitudesRepuestos));
  }

  limpiarBandeja(): void {
    if (confirm('¿Estás seguro de eliminar TODAS las solicitudes de la bandeja?')) {
      this.solicitudesRepuestos = [];
      localStorage.setItem('tecnitron_solicitudes_repuestos', JSON.stringify([]));
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}