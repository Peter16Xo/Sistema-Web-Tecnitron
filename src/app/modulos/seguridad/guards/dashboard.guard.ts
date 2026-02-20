/* GUARD: Protección de Dashboard
 * Autores: Adiel Stalin López Moreno, Pedro Andrés Avilés Baque, Jonnel, Grizlly, Javier
 * Descripción: Guard que protege el acceso a los dashboards específicos según el rol
 * Fecha: 2026
 */

import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AutenticacionServicio } from '../../../servicios/autenticacion.servicio';

/**
 * Guard para Dashboard de Administrador
 */
export const administradorGuard: CanActivateFn = (route, state) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  const usuarioAutenticado = autenticacionServicio.obtenerUsuarioActual();

  if (!usuarioAutenticado) {
    router.navigate(['/login']);
    return false;
  }

  if (usuarioAutenticado.rol.tipo === 'administrador') {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};

/**
 * Guard para Dashboard de Recepcionista
 */
export const recepcionstaGuard: CanActivateFn = (route, state) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  const usuarioAutenticado = autenticacionServicio.obtenerUsuarioActual();

  if (!usuarioAutenticado) {
    router.navigate(['/login']);
    return false;
  }

  if (usuarioAutenticado.rol.tipo === 'recepcionista') {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};

/**
 * Guard para Dashboard de Técnico
 */
export const tecnicoGuard: CanActivateFn = (route, state) => {
  const autenticacionServicio = inject(AutenticacionServicio);
  const router = inject(Router);

  const usuarioAutenticado = autenticacionServicio.obtenerUsuarioActual();

  if (!usuarioAutenticado) {
    router.navigate(['/login']);
    return false;
  }

  if (usuarioAutenticado.rol.tipo === 'tecnico') {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};
