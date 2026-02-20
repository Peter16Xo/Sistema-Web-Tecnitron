/**
 * SERVICIO: Cliente
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Servicio para gestionar operaciones CRUD de clientes en el sistema
 * Fecha: 2026
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Cliente } from '../modelos/cliente.modelo';
import { clientesSimulados } from './datos-clientes-simulados';

@Injectable({
  providedIn: 'root'
})
export class ClienteServicio {
  // Observable para notificar cambios en la lista de clientes
  private clientesSubject = new BehaviorSubject<Cliente[]>(clientesSimulados);
  clientes$ = this.clientesSubject.asObservable();

  constructor() { }

  /**
   * Obtiene todos los clientes del sistema
   * @returns Observable con lista de clientes
   */
  public obtenerTodosLosClientes(): Observable<Cliente[]> {
    return of([...clientesSimulados]);
  }

  /**
   * Obtiene solo los clientes activos
   * @returns Observable con lista de clientes activos
   */
  public obtenerClientesActivos(): Observable<Cliente[]> {
    const activos = clientesSimulados.filter((c: Cliente) => c.activo);
    return of(activos);
  }

  /**
   * Obtiene un cliente por su ID
   * @param id Identificador del cliente
   * @returns Observable con el cliente encontrado
   */
  public obtenerClientePorId(id: string): Observable<Cliente | null> {
    const cliente = clientesSimulados.find((c: Cliente) => c.id === id);
    return of(cliente || null);
  }

  /**
   * Busca clientes por criterio (nombre, apellido, email, teléfono)
   * @param criterio Texto a buscar
   * @returns Observable con clientes coincidentes
   */
  public buscarClientes(criterio: string): Observable<Cliente[]> {
    const criterioLower = criterio.toLowerCase();
    const resultados = clientesSimulados.filter((c: Cliente) =>
      c.nombre.toLowerCase().includes(criterioLower) ||
      c.apellido.toLowerCase().includes(criterioLower) ||
      c.email.toLowerCase().includes(criterioLower) ||
      c.telefono.includes(criterio)
    );
    return of(resultados);
  }

  /**
   * Agrega un nuevo cliente al sistema
   * @param cliente Nuevo cliente a agregar
   * @returns Observable con confirmación
   */
  public agregarCliente(cliente: Cliente): Observable<boolean> {
    clientesSimulados.push(cliente);
    this.clientesSubject.next([...clientesSimulados]);
    return of(true);
  }

  /**
   * Actualiza un cliente existente
   * @param clienteActualizado Cliente con datos actualizados
   * @returns Observable con confirmación
   */
  public actualizarCliente(clienteActualizado: Cliente): Observable<boolean> {
    const indice = clientesSimulados.findIndex((c: Cliente) => c.id === clienteActualizado.id);
    if (indice !== -1) {
      clientesSimulados[indice] = clienteActualizado;
      this.clientesSubject.next([...clientesSimulados]);
      return of(true);
    }
    return of(false);
  }

  /**
   * Desactiva un cliente (soft delete)
   * @param id ID del cliente a desactivar
   * @returns Observable con confirmación
   */
  public desactivarCliente(id: string): Observable<boolean> {
    const cliente = clientesSimulados.find((c: Cliente) => c.id === id);
    if (cliente) {
      cliente.activo = false;
      this.clientesSubject.next([...clientesSimulados]);
      return of(true);
    }
    return of(false);
  }

  /**
   * Obtiene estadísticas de clientes
   * @returns Observable con objeto de estadísticas
   */
  public obtenerEstadisticas(): Observable<any> {
    const total = clientesSimulados.length;
    const activos = clientesSimulados.filter((c: Cliente) => c.activo).length;
    const inactivos = total - activos;

    return of({
      totalClientes: total,
      clientesActivos: activos,
      clientesInactivos: inactivos,
      clientesEsteAño: clientesSimulados.filter((c: Cliente) => 
        new Date(c.fechaRegistro).getFullYear() === new Date().getFullYear()
      ).length
    });
  }
}
