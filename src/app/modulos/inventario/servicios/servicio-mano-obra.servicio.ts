/**
 * SERVICIO: Servicio de Mano de Obra
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Gestiona operaciones CRUD para los servicios de mano de obra del catálogo.
 * Fecha: 2026
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ServicioManoObra } from '../modelos/servicio.modelo';
import { serviciosSimulados } from './datos-servicios-simulados';

@Injectable({
  providedIn: 'root'
})
export class ServicioManoObraServicio {
  private serviciosSubject = new BehaviorSubject<ServicioManoObra[]>(serviciosSimulados);
  servicios$ = this.serviciosSubject.asObservable();

  constructor() { }

  public obtenerTodosLosServicios(): Observable<ServicioManoObra[]> {
    return of([...serviciosSimulados]);
  }

  public obtenerServicioPorId(id: string): Observable<ServicioManoObra | null> {
    const servicio = serviciosSimulados.find(s => s.id === id);
    return of(servicio || null);
  }

  public agregarServicio(servicio: ServicioManoObra): Observable<boolean> {
    serviciosSimulados.push(servicio);
    this.serviciosSubject.next([...serviciosSimulados]);
    return of(true);
  }

  public actualizarServicio(servicioAct: ServicioManoObra): Observable<boolean> {
    const index = serviciosSimulados.findIndex(s => s.id === servicioAct.id);
    if (index !== -1) {
      serviciosSimulados[index] = servicioAct;
      this.serviciosSubject.next([...serviciosSimulados]);
      return of(true);
    }
    return of(false);
  }

  public desactivarServicio(id: string): Observable<boolean> {
    const servicio = serviciosSimulados.find(s => s.id === id);
    if (servicio) {
      servicio.activo = false;
      this.serviciosSubject.next([...serviciosSimulados]);
      return of(true);
    }
    return of(false);
  }

  public eliminarServicioDefinitivo(id: string): Observable<boolean> {
    const index = serviciosSimulados.findIndex(s => s.id === id);
    if (index !== -1) {
      serviciosSimulados.splice(index, 1);
      this.serviciosSubject.next([...serviciosSimulados]);
      return of(true);
    }
    return of(false);
  }
}