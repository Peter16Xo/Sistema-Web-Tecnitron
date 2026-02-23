import { OrdenTrabajo } from '../modelos/orden.modelo';

export const ordenesSimuladas: OrdenTrabajo[] = [
  {
    id: '1708610000001',
    codigo: 'ORD-0001',
    clienteId: '1', // Asumiendo que Juan García tiene ID 1 en tu mock de clientes
    clienteNombre: 'Juan García',
    clienteCedula: '0987654321',
    tecnicoId: '3', // ID de un técnico
    tecnicoNombre: 'Carlos Mendoza',
    equipo: {
      tipo: 'Smartphone',
      marca: 'Samsung',
      modelo: 'Galaxy S21',
      serie: 'SMG991B-XYZ123'
    },
    diagnostico: {
      fallaReportada: 'La pantalla parpadea y a veces no responde al tacto.',
      accesoriosRecibidos: 'Funda transparente, sin cargador.',
      informeTecnico: 'Display LCD dañado por impacto interno. Requiere cambio completo.',
      presupuestoEstimado: 75.00
    },
    items: [
      { tipo: 'repuesto', itemId: 'r1', nombre: 'Pantalla LCD Genérica', cantidad: 1, precioUnitario: 45.50, subtotal: 45.50 },
      { tipo: 'servicio', itemId: 's1', nombre: 'Diagnóstico', cantidad: 1, precioUnitario: 15.00, subtotal: 15.00 }
    ],
    estado: 'En Reparación',
    fechaRecepcion: new Date('2026-02-20T10:30:00'),
    fechaActualizacion: new Date('2026-02-21T14:15:00'),
    subtotal: 60.50,
    iva: 7.26,
    total: 67.76
  },
  {
    id: '1708610000002',
    codigo: 'ORD-0002',
    clienteId: '2', 
    clienteNombre: 'María López',
    clienteCedula: '0912345678',
    equipo: {
      tipo: 'Laptop',
      marca: 'Dell',
      modelo: 'Inspiron 15',
      serie: 'DL-987654'
    },
    diagnostico: {
      fallaReportada: 'Se apaga sola a los 10 minutos de uso. Calienta mucho.',
      accesoriosRecibidos: 'Cargador original.'
    },
    items: [],
    estado: 'Recibido',
    fechaRecepcion: new Date('2026-02-23T09:00:00'),
    fechaActualizacion: new Date('2026-02-23T09:00:00'),
    subtotal: 0,
    iva: 0,
    total: 0
  },
  {
    id: '1708610000003',
    codigo: 'ORD-0003',
    clienteId: '4', 
    clienteNombre: 'Ana Rodríguez',
    tecnicoId: '4',
    tecnicoNombre: 'Juan Pérez',
    equipo: {
      tipo: 'Consola',
      marca: 'Sony',
      modelo: 'PlayStation 5',
      serie: 'PS5-AABBCC'
    },
    diagnostico: {
      fallaReportada: 'No enciende, puerto HDMI flojo.',
      accesoriosRecibidos: 'Consola y cable de poder.',
      informeTecnico: 'Puerto HDMI reemplazado, limpieza interna de ventiladores realizada.',
      presupuestoEstimado: 45.00
    },
    items: [
      { tipo: 'servicio', itemId: 's2', nombre: 'Mano de Obra Especializada', cantidad: 1, precioUnitario: 30.00, subtotal: 30.00 },
      { tipo: 'repuesto', itemId: 'r3', nombre: 'Puerto HDMI PS5', cantidad: 1, precioUnitario: 15.00, subtotal: 15.00 }
    ],
    estado: 'Listo',
    fechaRecepcion: new Date('2026-02-18T16:20:00'),
    fechaActualizacion: new Date('2026-02-22T11:00:00'),
    subtotal: 45.00,
    iva: 5.40,
    total: 50.40
  }
];