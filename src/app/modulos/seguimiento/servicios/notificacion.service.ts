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
  
  // CREDENCIALES REALES DE EMAILJS
  private SERVICE_ID = 'service_jtp01zr';
  private TEMPLATE_ID = 'template_680thmn';
  private PUBLIC_KEY = 'uog7_Q4T2gMk4NlMF';

  constructor() {
    emailjs.init(this.PUBLIC_KEY);
  }

  public enviarNotificacionEstado(orden: OrdenTrabajo): void {
    if (!orden.clienteEmail) {
      console.warn('⚠️ No se puede enviar correo: El cliente no tiene email registrado en la orden.');
      return;
    }

    const enlaceTracker = `http://localhost:4200/tracker/${orden.codigoSeguimiento}`;
    
    // 1. OBTENEMOS EL HISTORIAL (Si es una orden vieja sin historial, simulamos el actual)
    const historial = orden.historialEstados && orden.historialEstados.length > 0 
                      ? orden.historialEstados 
                      : [{ estado: orden.estado, fecha: orden.fechaActualizacion }];
    
    // Invertimos el arreglo para que el estado MÁS RECIENTE quede arriba (como Temu)
    const historialInvertido = [...historial].reverse();

    // 2. CONSTRUIMOS EL HTML DE LA LÍNEA DE TIEMPO DINÁMICAMENTE
    let timelineHtml = '';

    historialInvertido.forEach((paso, index) => {
      const fecha = new Date(paso.fecha);
      const opcionesFecha: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      const opcionesHora: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      const fechaStr = `${fecha.toLocaleDateString('es-EC', opcionesFecha)}, ${fecha.toLocaleTimeString('es-EC', opcionesHora).toLowerCase()}`;
      
      const isLatest = index === 0;
      const isLast = index === historialInvertido.length - 1;

      if (isLatest) {
        // DISEÑO DEL PASO ACTUAL (Naranja, círculo grande)
        timelineHtml += `
        <tr>
          <td style="width: 30px; vertical-align: top; padding-top: 3px;">
            <div style="width: 14px; height: 14px; background-color: #ff9800; border-radius: 50%; box-shadow: 0 0 0 4px #fff3e0;"></div>
            ${!isLast ? '<div style="width: 2px; height: 40px; background-color: #eee; margin-left: 6px; margin-top: 5px;"></div>' : ''}
          </td>
          <td style="padding-bottom: 20px; vertical-align: top;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #ff9800;">
              ${paso.estado.toUpperCase()} <span style="font-size: 10px; color: #999; font-weight: normal; margin-left: 8px; text-transform: uppercase;">MÁS RECIENTE</span>
            </p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">${fechaStr}</p>
          </td>
        </tr>`;
      } else {
        // DISEÑO DE LOS PASOS ANTERIORES (Gris, círculo pequeño)
        timelineHtml += `
        <tr>
          <td style="width: 30px; vertical-align: top; padding-top: 5px;">
            <div style="width: 10px; height: 10px; background-color: #d0d0d0; border-radius: 50%; margin-left: 2px;"></div>
            ${!isLast ? '<div style="width: 2px; height: 40px; background-color: #eee; margin-left: 6px; margin-top: 5px;"></div>' : ''}
          </td>
          <td style="padding-bottom: 20px; vertical-align: top;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #444;">${paso.estado.toUpperCase()}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #888;">${fechaStr}</p>
          </td>
        </tr>`;
      }
    });

    // 3. PARAMETROS PARA EMAILJS
    const templateParams = {
      to_name: orden.clienteNombre,
      to_email: orden.clienteEmail,
      orden_codigo: orden.codigo,
      codigo_seguimiento: orden.codigoSeguimiento,
      equipo: `${orden.equipo.marca} ${orden.equipo.modelo}`,
      falla: orden.diagnostico.fallaReportada,
      total_pagar: orden.total > 0 ? orden.total.toFixed(2) : 'Por cotizar',
      link_tracker: enlaceTracker,
      timeline_html: timelineHtml // <--- MANDAMOS EL HTML GENERADO
    };

    console.log(`Intentando enviar correo automático a: ${templateParams.to_email}...`);

    emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams)
      .then((response) => {
        console.log('✅ ¡CORREO ENVIADO CON ÉXITO AL CLIENTE!');
      }, (error) => {
        console.error('❌ ERROR AL ENVIAR EL CORREO...', error);
      });
  }
}