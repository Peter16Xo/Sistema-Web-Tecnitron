/**
 * SERVICIO: Cliente
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
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
   * Busca clientes por criterio (nombre, apellido, email, teléfono, cédula)
   * @param criterio Texto a buscar
   * @returns Observable con clientes coincidentes
   */
  public buscarClientes(criterio: string): Observable<Cliente[]> {
    const criterioLower = criterio.toLowerCase();
    const resultados = clientesSimulados.filter((c: Cliente) =>
      c.nombre.toLowerCase().includes(criterioLower) ||
      c.apellido.toLowerCase().includes(criterioLower) ||
      c.email.toLowerCase().includes(criterioLower) ||
      c.cedula.includes(criterio) ||
      c.telefono.includes(criterio)
    );
    return of(resultados);
  }

  /**
   * Valida que la cédula sea única (no exista otro cliente con la misma cédula)
   * @param cedula Cédula a validar
   * @param clienteIdActual ID del cliente actual (para edición, se excluye del validación)
   * @returns Observable con booleano indicando si es única
   */
  public validarCedulaUnica(cedula: string, clienteIdActual?: string): Observable<boolean> {
    const cedulaExistente = clientesSimulados.find((c: Cliente) => 
      c.cedula === cedula && c.id !== clienteIdActual
    );
    return of(!cedulaExistente);
  }

  /**
   * Valida que el email sea único (no exista otro cliente con el mismo email)
   * @param email Email a validar
   * @param clienteIdActual ID del cliente actual (para edición, se excluye del validación)
   * @returns Observable con booleano indicando si es único
   */
  public validarEmailUnico(email: string, clienteIdActual?: string): Observable<boolean> {
    const emailExistente = clientesSimulados.find((c: Cliente) => 
      c.email.toLowerCase() === email.toLowerCase() && c.id !== clienteIdActual
    );
    return of(!emailExistente);
  }

  /**
   * Obtiene clientes asociados a un cliente (para historial de reparaciones)
   * @param clienteId ID del cliente
   * @returns Observable con información del cliente y sus reparaciones
   */
  public obtenerClienteConHistorial(clienteId: string): Observable<any> {
    const cliente = clientesSimulados.find((c: Cliente) => c.id === clienteId);
    if (!cliente) {
      return of(null);
    }
    
    // Retorna cliente con historial de reparaciones (estructura preparada para futuro módulo de órdenes)
    return of({
      ...cliente,
      historialReparaciones: []
    });
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
