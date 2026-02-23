/**
 * SERVICIO: Repuesto
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Gestiona operaciones CRUD, búsqueda y actualización de stock de repuestos.
 * Fecha: 2026
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Repuesto } from '../modelos/repuesto.modelo';
import { repuestosSimulados } from './datos-repuestos-simulados';

@Injectable({
  providedIn: 'root'
})
export class RepuestoServicio {
  // Observable para notificar cambios en la tabla en tiempo real
  private repuestosSubject = new BehaviorSubject<Repuesto[]>(repuestosSimulados);
  repuestos$ = this.repuestosSubject.asObservable();

  constructor() { }

  public obtenerTodosLosRepuestos(): Observable<Repuesto[]> {
    return of([...repuestosSimulados]);
  }

  public obtenerRepuestoPorId(id: string): Observable<Repuesto | null> {
    const repuesto = repuestosSimulados.find(r => r.id === id);
    return of(repuesto || null);
  }

  // Búsqueda de repuestos (Nombre o Descripción)
  public buscarRepuestos(criterio: string): Observable<Repuesto[]> {
    const term = criterio.toLowerCase();
    const resultados = repuestosSimulados.filter(r => 
      r.nombre.toLowerCase().includes(term) || 
      r.descripcion.toLowerCase().includes(term)
    );
    return of(resultados);
  }

  // Registrar Nuevo Repuesto
  public agregarRepuesto(repuesto: Repuesto): Observable<boolean> {
    repuestosSimulados.push(repuesto);
    this.repuestosSubject.next([...repuestosSimulados]);
    return of(true);
  }

  // Editar Repuesto
  public actualizarRepuesto(repuestoAct: Repuesto): Observable<boolean> {
    const index = repuestosSimulados.findIndex(r => r.id === repuestoAct.id);
    if (index !== -1) {
      repuestosSimulados[index] = repuestoAct;
      this.repuestosSubject.next([...repuestosSimulados]);
      return of(true);
    }
    return of(false);
  }

  // Actualizar Stock (Entrada/Salida)
  public modificarStock(id: string, cantidad: number, tipo: 'entrada' | 'salida'): Observable<boolean> {
    const repuesto = repuestosSimulados.find(r => r.id === id);
    if (repuesto) {
      if (tipo === 'entrada') {
        repuesto.stock += cantidad;
      } else if (tipo === 'salida' && repuesto.stock >= cantidad) {
        repuesto.stock -= cantidad;
      } else {
        return of(false); // No hay stock suficiente para la salida
      }
      this.repuestosSubject.next([...repuestosSimulados]);
      return of(true);
    }
    return of(false);
  }

  // Eliminar Repuesto (Borrado lógico / Soft Delete)
  public desactivarRepuesto(id: string): Observable<boolean> {
    const repuesto = repuestosSimulados.find(r => r.id === id);
    if (repuesto) {
      repuesto.activo = false;
      this.repuestosSubject.next([...repuestosSimulados]);
      return of(true);
    }
    return of(false);
  }
  // Eliminar Repuesto Físicamente (Hard Delete)
  public eliminarRepuestoDefinitivo(id: string): Observable<boolean> {
    const index = repuestosSimulados.findIndex(r => r.id === id);
    if (index !== -1) {
      repuestosSimulados.splice(index, 1); // Lo borra totalmente del arreglo
      this.repuestosSubject.next([...repuestosSimulados]);
      return of(true);
    }
    return of(false);
  }
}