/* GUARD: Autenticación
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Guard que verifica si el usuario está autenticado
 * Fecha: 2026
 */

import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionServicio } from '../../../servicios/autenticacion.servicio';

/**
 * Guard de autenticación
 * Verifica que el usuario esté autenticado antes de acceder a rutas protegidas
 */
export const autenticacionGuard: CanActivateFn = (route, state) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  const usuarioAutenticado = autenticacionServicio.obtenerUsuarioActual();

  if (usuarioAutenticado) {
    return true;
  } else {
    // Redirigir al login si no está autenticado
    router.navigate(['/login']);
    return false;
  }
};

/**
 * Guard de roles
 * Verifica que el usuario tenga el rol requerido para acceder a la ruta
 */
export const rolGuard: CanActivateFn = (route, state) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  const usuarioAutenticado = autenticacionServicio.obtenerUsuarioActual();

  if (!usuarioAutenticado) {
    router.navigate(['/login']);
    return false;
  }

  const rolesRequeridos = route.data['roles'] as string[];

  if (rolesRequeridos && rolesRequeridos.length > 0) {
    const tipoRolUsuario = usuarioAutenticado.rol.tipo;

    if (rolesRequeridos.includes(tipoRolUsuario)) {
      return true;
    } else {
      // Redirigir al dashboard si no tiene permisos
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
