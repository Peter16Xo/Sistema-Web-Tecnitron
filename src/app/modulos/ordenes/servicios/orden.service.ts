/**
 * SERVICIO: Órdenes de Trabajo
 * Descripción: Gestión del ciclo de vida de una reparación (CRUD y Estados)
 * Fecha: 2026
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { OrdenTrabajo, EstadoOrden } from '../modelos/orden.modelo';
import { ordenesSimuladas } from './datos-ordenes-simulados';

@Injectable({
  providedIn: 'root'
})
export class OrdenServicio {
  // BehaviorSubject para reactividad (actualiza dashboards y listas instantáneamente)
  private ordenesSubject = new BehaviorSubject<OrdenTrabajo[]>(ordenesSimuladas);
  ordenes$ = this.ordenesSubject.asObservable();

  constructor() { }

  /**
   * Obtiene la lista completa de órdenes (Para Administrador y Recepcionista)
   */
  public obtenerTodasLasOrdenes(): Observable<OrdenTrabajo[]> {
    return this.ordenes$;
  }

  /**
   * Obtiene órdenes filtradas por estado o técnico (Para el Técnico)
   */
  public obtenerOrdenesPorTecnico(tecnicoId: string): Observable<OrdenTrabajo[]> {
    const filtradas = ordenesSimuladas.filter(o => o.tecnicoId === tecnicoId);
    return of(filtradas);
  }

  /**
   * Busca una orden por su ID
   */
  public obtenerOrdenPorId(id: string): Observable<OrdenTrabajo | null> {
    const orden = ordenesSimuladas.find(o => o.id === id);
    return of(orden ? { ...orden } : null);
  }

  /**
   * Genera un nuevo código secuencial (Ej: ORD-0004) [Requisito RF-ORD-01]
   */
  private generarCodigoUnico(): string {
    const numero = ordenesSimuladas.length + 1;
    return `ORD-${numero.toString().padStart(4, '0')}`;
  }

  /**
   * Crea una nueva orden de trabajo (Recepcionista)
   */
  public crearOrden(nuevaOrden: Partial<OrdenTrabajo>): Observable<OrdenTrabajo> {
    const ordenCompletada: OrdenTrabajo = {
      ...nuevaOrden,
      id: Date.now().toString(),
      codigo: this.generarCodigoUnico(),
      estado: 'Recibido',
      items: [],
      subtotal: 0,
      iva: 0,
      total: 0,
      fechaRecepcion: new Date(),
      fechaActualizacion: new Date(),
    } as OrdenTrabajo;

    ordenesSimuladas.unshift(ordenCompletada); // Agregar al inicio
    this.ordenesSubject.next([...ordenesSimuladas]);
    return of(ordenCompletada);
  }

  /**
   * Actualiza el diagnóstico y calcula los totales automáticamente [Requisitos RF-ORD-03 y RF-ORD-04]
   */
  public actualizarOrden(ordenAct: OrdenTrabajo): Observable<boolean> {
    const index = ordenesSimuladas.findIndex(o => o.id === ordenAct.id);
    if (index !== -1) {
      // Recalcular totales en base a los ítems agregados
      const subtotal = ordenAct.items.reduce((sum, item) => sum + item.subtotal, 0);
      const iva = subtotal * 0.15; // ¡ACTUALIZADO A IVA 15%!
      
      ordenesSimuladas[index] = {
        ...ordenAct,
        subtotal: subtotal,
        iva: iva,
        total: subtotal + iva,
        fechaActualizacion: new Date()
      };
      
      this.ordenesSubject.next([...ordenesSimuladas]);
      return of(true);
    }
    return of(false);
  }


  /**
   * Cambia el estado de la orden (Flujo de reparación) [Requisito RF-ORD-05]
   */
  public cambiarEstado(id: string, nuevoEstado: EstadoOrden): Observable<boolean> {
    const index = ordenesSimuladas.findIndex(o => o.id === id);
    if (index !== -1) {
      ordenesSimuladas[index].estado = nuevoEstado;
      ordenesSimuladas[index].fechaActualizacion = new Date();
      
      // Si se marca como entregada, guardar la fecha de entrega final
      if (nuevoEstado === 'Entregado') {
        ordenesSimuladas[index].fechaEntrega = new Date();
      }

      this.ordenesSubject.next([...ordenesSimuladas]);
      
      // Aquí a futuro se disparará el Módulo de Notificaciones Automáticas (RF-TRK-03)
      return of(true);
    }
    return of(false);
  }

  /**
   * Asigna un técnico a una orden específica [Requisito RF-ORD-02]
   */
  public asignarTecnico(id: string, tecnicoId: string, tecnicoNombre: string): Observable<boolean> {
    const index = ordenesSimuladas.findIndex(o => o.id === id);
    if (index !== -1) {
      ordenesSimuladas[index].tecnicoId = tecnicoId;
      ordenesSimuladas[index].tecnicoNombre = tecnicoNombre;
      ordenesSimuladas[index].fechaActualizacion = new Date();
      this.ordenesSubject.next([...ordenesSimuladas]);
      return of(true);
    }
    return of(false);
  }

  /**
   * Búsqueda general para recepcionistas [Requisito RF-ORD-06]
   */
  public buscarOrdenes(criterio: string): Observable<OrdenTrabajo[]> {
    const busqueda = criterio.toLowerCase();
    const filtradas = ordenesSimuladas.filter(o => 
      o.codigo.toLowerCase().includes(busqueda) || 
      (o.clienteCedula && o.clienteCedula.includes(busqueda)) ||
      (o.clienteNombre && o.clienteNombre.toLowerCase().includes(busqueda)) ||
      o.equipo.marca.toLowerCase().includes(busqueda)
    );
    return of(filtradas);
  }
}