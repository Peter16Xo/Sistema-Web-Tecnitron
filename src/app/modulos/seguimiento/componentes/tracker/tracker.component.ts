import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { OrdenServicio } from '../../../ordenes/servicios/orden.service';
import { OrdenTrabajo } from '../../../ordenes/modelos/orden.modelo';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.css'
})
export class TrackerComponent implements OnInit {
  codigoBuscado: string = '';
  ordenEncontrada: OrdenTrabajo | null = null;
  mensajeError: string = '';
  buscando: boolean = false;

  // Los 5 pasos de nuestro flujo normal
  pasosFlujo = ['Recibido', 'Diagnóstico', 'En Reparación', 'Listo', 'Entregado'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordenServicio: OrdenServicio
  ) {}

  ngOnInit(): void {
    // Verificamos si el cliente entró a través del link del correo (con el código en la URL)
    this.route.params.subscribe(params => {
      if (params['codigo']) {
        this.codigoBuscado = params['codigo'];
        this.buscarOrden();
      }
    });
  }

  buscarOrden(): void {
    if (!this.codigoBuscado.trim()) return;
    
    this.buscando = true;
    this.mensajeError = '';
    this.ordenEncontrada = null;

    // Simulamos un pequeño retraso de red para que se vea profesional el "Buscando..."
    setTimeout(() => {
      this.ordenServicio.buscarOrdenPorCodigoSeguimiento(this.codigoBuscado.trim()).subscribe(orden => {
        this.buscando = false;
        
        if (orden) {
          this.ordenEncontrada = orden;
          // Actualizamos la URL silenciosamente para que el cliente pueda guardarla en favoritos
          this.locationReplace();
        } else {
          this.mensajeError = 'No se encontró ningún equipo asociado a este código. Verifica e inténtalo nuevamente.';
        }
      });
    }, 800);
  }

  private locationReplace() {
    window.history.replaceState({}, '', `/tracker/${this.codigoBuscado}`);
  }

  // Lógica para la línea de tiempo (Stepper)
  obtenerIndicePasoActual(): number {
    if (!this.ordenEncontrada) return -1;
    if (this.ordenEncontrada.estado === 'Cancelado') return -1; // El flujo se rompe si es cancelado
    
    return this.pasosFlujo.indexOf(this.ordenEncontrada.estado);
  }
  // NUEVO: Busca en la bitácora si ese paso ya tiene una fecha registrada
  obtenerFechaPaso(paso: string): Date | null {
    if (!this.ordenEncontrada || !this.ordenEncontrada.historialEstados) return null;
    
    const registro = this.ordenEncontrada.historialEstados.find(h => h.estado === paso);
    return registro ? registro.fecha : null;
  }
}