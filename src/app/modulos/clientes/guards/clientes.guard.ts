/**
 * GUARD: Clientes Guard
 * Autores: Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
 * Descripción: Guard para proteger acceso al módulo de clientes (Recepcionista y Admin)
 * Fecha: 2026
 */

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AutenticacionServicio } from '../../../servicios/autenticacion.servicio';

@Injectable({
  providedIn: 'root'
})
export class ClientesGuard implements CanActivate {
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();

    // Verifica que el usuario esté autenticado
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return false;
    }

    // Permite acceso solo a Recepcionista y Administrador
    const tipoRol = usuarioActual.rol.tipo;
    if (tipoRol === 'recepcionista' || tipoRol === 'administrador') {
      return true;
    }

    // Si no tiene permiso, redirige al dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }
}
