/* CONTROLADOR: Dashboard Principal
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Componente principal que redirige al dashboard apropiado según el rol del usuario
 * Fecha: 2026
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutenticacionServicio } from '../../../../servicios/autenticacion.servicio';
import { Usuario } from '../../modelos/usuario.modelo';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // PROPIEDADES: Control del componente
  private destroy$ = new Subject<void>();
  usuarioAutenticado: Usuario | null = null;
  estaCargando = true;
  tipoRol: string = '';

  /**
   * Constructor del componente
   * @param autenticacionServicio Servicio de autenticación
   * @param router Servicio de enrutamiento
   */
  constructor(
    private autenticacionServicio: AutenticacionServicio,
    private router: Router
  ) {}

  /**
   * Inicializa el componente
   * Verifica autenticación y redirige al dashboard correspondiente
   */
  ngOnInit(): void {
    // Suscribirse al usuario autenticado
    this.autenticacionServicio.usuarioAutenticado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario: any) => {
        if (usuario) {
          this.usuarioAutenticado = usuario;
          this.tipoRol = usuario.rol.tipo;
          this.redirigirDashboardSegunRol(usuario.rol.tipo);
        } else {
          // Si no hay usuario autenticado, redirigir al login
          this.router.navigate(['/login']);
        }
        this.estaCargando = false;
      });
  }

  /**
   * Redirige al dashboard apropiado según el rol del usuario
   * @param tipoRol Tipo de rol del usuario (administrador, recepcionista, tecnico)
   */
  private redirigirDashboardSegunRol(tipoRol: string): void {
    switch (tipoRol) {
      case 'administrador':
        this.router.navigate(['/dashboard/administrador']);
        break;
      case 'recepcionista':
        this.router.navigate(['/dashboard/recepcionista']);
        break;
      case 'tecnico':
        this.router.navigate(['/dashboard/tecnico']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
