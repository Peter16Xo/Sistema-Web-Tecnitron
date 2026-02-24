/**
 * SERVICIO: Notificaciones y Correos Automáticos
 * Descripción: Integración con EmailJS para enviar alertas de cambio de estado.
 * Fecha: 2026
 */
import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { OrdenTrabajo } from '../../ordenes/modelos/orden.modelo';

@Injectable({
  providedIn: 'root'
})
export class NotificacionServicio {
  
  // ✅ CREDENCIALES REALES DE EMAILJS
  private SERVICE_ID = 'service_jtp01zr';
  private TEMPLATE_ID = 'template_680thmn';
  private PUBLIC_KEY = 'uog7_Q4T2gMk4NlMF';

  constructor() {
    // Inicializar EmailJS
    emailjs.init(this.PUBLIC_KEY);
  }

  /**
   * Dispara un correo al cliente informando el nuevo estado de su equipo.
   */
  public enviarNotificacionEstado(orden: OrdenTrabajo): void {
    if (!orden.clienteEmail) {
      console.warn('⚠️ No se puede enviar correo: El cliente no tiene email registrado en la orden.', orden);
      return;
    }

    // El enlace mágico hacia el tracker de tu sistema (Módulo 5 que haremos a continuación)
    const enlaceTracker = `http://localhost:4200/tracker/${orden.codigoSeguimiento}`;

    // Parámetros que viajarán a la plantilla HTML del correo
    const templateParams = {
      to_name: orden.clienteNombre,
      to_email: orden.clienteEmail,
      orden_codigo: orden.codigo,
      estado_actual: orden.estado.toUpperCase(),
      equipo: `${orden.equipo.marca} ${orden.equipo.modelo}`,
      falla: orden.diagnostico.fallaReportada,
      link_tracker: enlaceTracker
    };

    console.log(`Intentando enviar correo automático a: ${templateParams.to_email}...`);

    // 🚀 MODO PRODUCCIÓN (EmailJS): ENVÍO REAL
    emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams)
      .then((response) => {
        console.log('✅ ¡CORREO ENVIADO CON ÉXITO AL CLIENTE!', response.status, response.text);
      }, (error) => {
        console.error('❌ ERROR AL ENVIAR EL CORREO...', error);
      });
  }
}