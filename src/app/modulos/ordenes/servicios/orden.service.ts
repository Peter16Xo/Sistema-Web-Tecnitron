/**
 * SERVICIO: Órdenes de Trabajo
 * Descripción: Gestión del ciclo de vida de una reparación con almacenamiento persistente y bitácora de estados.
 * Fecha: 2026
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { OrdenTrabajo, EstadoOrden } from '../modelos/orden.modelo';
import { ordenesSimuladas } from './datos-ordenes-simulados';
import { NotificacionServicio } from '../../seguimiento/servicios/notificacion.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenServicio {
  // Nuestra "Base de Datos" interna
  private ordenesDB: OrdenTrabajo[] = [];
  
  private ordenesSubject = new BehaviorSubject<OrdenTrabajo[]>([]);
  ordenes$ = this.ordenesSubject.asObservable();

  constructor(private notificacionServicio: NotificacionServicio) { 
    this.inicializarDB();
  }

  // ==========================================
  // LÓGICA DE BASE DE DATOS PERSISTENTE (LOCALSTORAGE)
  // ==========================================
  private inicializarDB() {
    const guardado = localStorage.getItem('tecnitron_db_ordenes');
    if (guardado) {
      this.ordenesDB = JSON.parse(guardado);
    } else {
      // Si es la primera vez, cargamos las de prueba y guardamos
      this.ordenesDB = [...ordenesSimuladas];
      this.guardarDB();
    }
    this.ordenesSubject.next([...this.ordenesDB]);
  }

  private guardarDB() {
    localStorage.setItem('tecnitron_db_ordenes', JSON.stringify(this.ordenesDB));
    this.ordenesSubject.next([...this.ordenesDB]);
  }

  // ==========================================
  // MÉTODOS CRUD
  // ==========================================
  public obtenerTodasLasOrdenes(): Observable<OrdenTrabajo[]> {
    return this.ordenes$;
  }

  public obtenerOrdenesPorTecnico(tecnicoId: string): Observable<OrdenTrabajo[]> {
    return of(this.ordenesDB.filter(o => o.tecnicoId === tecnicoId));
  }

  public obtenerOrdenPorId(id: string): Observable<OrdenTrabajo | null> {
    const orden = this.ordenesDB.find(o => o.id === id);
    return of(orden ? { ...orden } : null);
  }

  private generarCodigoUnico(): string {
    const numero = this.ordenesDB.length + 1;
    return `ORD-${numero.toString().padStart(4, '0')}`;
  }

  private generarCodigoSeguimiento(): string {
    const prefijo = 'OD';
    const numAleatorio = Math.floor(Math.random() * 900) + 100;
    const timestamp = Date.now().toString();
    return `${prefijo}-${numAleatorio}-${timestamp}`;
  }

  public crearOrden(nuevaOrden: Partial<OrdenTrabajo>): Observable<OrdenTrabajo> {
    const ordenCompletada: OrdenTrabajo = {
      ...nuevaOrden,
      id: Date.now().toString(),
      codigo: this.generarCodigoUnico(),
      codigoSeguimiento: this.generarCodigoSeguimiento(),
      estado: 'Recibido',
      items: [],
      subtotal: 0,
      iva: 0,
      total: 0,
      fechaRecepcion: new Date(),
      fechaActualizacion: new Date(),
      
      // NUEVO: Al crear la orden, registramos el primer estado en la bitácora
      historialEstados: [{ estado: 'Recibido', fecha: new Date() }]
      
    } as OrdenTrabajo;

    this.ordenesDB.unshift(ordenCompletada);
    this.guardarDB(); // Guardamos en memoria persistente
    
    this.notificacionServicio.enviarNotificacionEstado(ordenCompletada);
    return of(ordenCompletada);
  }

  public actualizarOrden(ordenAct: OrdenTrabajo): Observable<boolean> {
    const index = this.ordenesDB.findIndex(o => o.id === ordenAct.id);
    if (index !== -1) {
      const subtotal = ordenAct.items.reduce((sum, item) => sum + item.subtotal, 0);
      const iva = subtotal * 0.15;
      
      this.ordenesDB[index] = { ...ordenAct, subtotal, iva, total: subtotal + iva, fechaActualizacion: new Date() };
      this.guardarDB();
      return of(true);
    }
    return of(false);
  }

  public cambiarEstado(id: string, nuevoEstado: EstadoOrden): Observable<boolean> {
    const index = this.ordenesDB.findIndex(o => o.id === id);
    
    if (index !== -1 && this.ordenesDB[index].estado !== nuevoEstado) {
      this.ordenesDB[index].estado = nuevoEstado;
      this.ordenesDB[index].fechaActualizacion = new Date();
      if (nuevoEstado === 'Entregado') {
        this.ordenesDB[index].fechaEntrega = new Date();
      }

      // NUEVO: Agregamos a la bitácora la fecha exacta en la que llegó a este nuevo estado
      if (!this.ordenesDB[index].historialEstados) {
        this.ordenesDB[index].historialEstados = []; // Asegurarnos de que existe el arreglo
      }
      this.ordenesDB[index].historialEstados.push({ estado: nuevoEstado, fecha: new Date() });

      this.guardarDB(); // Guardar cambio de estado
      this.notificacionServicio.enviarNotificacionEstado(this.ordenesDB[index]);
      return of(true);
    }
    return of(false);
  }

  public asignarTecnico(id: string, tecnicoId: string, tecnicoNombre: string): Observable<boolean> {
    const index = this.ordenesDB.findIndex(o => o.id === id);
    if (index !== -1) {
      this.ordenesDB[index].tecnicoId = tecnicoId;
      this.ordenesDB[index].tecnicoNombre = tecnicoNombre;
      this.ordenesDB[index].fechaActualizacion = new Date();
      this.guardarDB();
      return of(true);
    }
    return of(false);
  }

  public buscarOrdenes(criterio: string): Observable<OrdenTrabajo[]> {
    const busqueda = criterio.toLowerCase();
    const filtradas = this.ordenesDB.filter(o => 
      o.codigo.toLowerCase().includes(busqueda) || 
      (o.clienteCedula && o.clienteCedula.includes(busqueda)) ||
      (o.clienteNombre && o.clienteNombre.toLowerCase().includes(busqueda)) ||
      o.equipo.marca.toLowerCase().includes(busqueda)
    );
    return of(filtradas);
  }

  // --- BÚSQUEDA PÚBLICA PARA EL TRACKER ---
  public buscarOrdenPorCodigoSeguimiento(codigoSeg: string): Observable<OrdenTrabajo | null> {
    const orden = this.ordenesDB.find(o => o.codigoSeguimiento === codigoSeg);
    return of(orden ? { ...orden } : null);
  }
}