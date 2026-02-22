/**
 * DATOS: Clientes Simulados
 * Autores: Pedro Andrés Avilés Baque,  Adiel Stalin López Moreno
 * Descripción: Base de datos simulada de clientes para desarrollo y pruebas
 * Fecha: 2026
 */

import { Cliente } from '../modelos/cliente.modelo';

export const clientesSimulados: Cliente[] = [
  {
    id: '1',
    cedula: '0912345678',
    nombre: 'Juan',
    apellido: 'García',
    email: 'juan.garcia@email.com',
    telefono: '0987654321',
    direccion: 'Calle Principal 123',
    ciudad: 'Guayaquil',
    provincia: 'Guayas',
    codigoPostal: '090514',
    activo: true,
    fechaRegistro: new Date('2024-01-15'),
    numeroOrdenes: 3,
    ultimaCompra: new Date('2026-02-10'),
    notas: 'Cliente frecuente, siempre puntual con pagos'
  },
  {
    id: '2',
    cedula: '0923456789',
    nombre: 'María',
    apellido: 'López',
    email: 'maria.lopez@email.com',
    telefono: '0987654322',
    direccion: 'Av. Secundaria 456',
    ciudad: 'Quito',
    provincia: 'Pichincha',
    codigoPostal: '170101',
    activo: true,
    fechaRegistro: new Date('2024-03-20'),
    numeroOrdenes: 5,
    ultimaCompra: new Date('2026-02-18'),
    notas: 'Requiere servicio técnico especializado'
  },
  {
    id: '3',
    cedula: '0934567890',
    nombre: 'Carlos',
    apellido: 'Martínez',
    email: 'carlos.martinez@email.com',
    telefono: '0987654323',
    direccion: 'Calle Tercera 789',
    ciudad: 'Cuenca',
    provincia: 'Azuay',
    codigoPostal: '010101',
    activo: true,
    fechaRegistro: new Date('2024-05-10'),
    numeroOrdenes: 2,
    ultimaCompra: new Date('2026-01-25'),
    notas: 'Nuevo cliente, referencia de cliente existente'
  },
  {
    id: '4',
    cedula: '0945678901',
    nombre: 'Ana',
    apellido: 'Rodríguez',
    email: 'ana.rodriguez@email.com',
    telefono: '0987654324',
    direccion: 'Av. Principal 321',
    ciudad: 'Guayaquil',
    provincia: 'Guayas',
    codigoPostal: '090514',
    activo: true,
    fechaRegistro: new Date('2024-07-05'),
    numeroOrdenes: 4,
    ultimaCompra: new Date('2026-02-15'),
    notas: 'Empresa corporativa, requiere facturación especial'
  },
  {
    id: '5',
    cedula: '0956789012',
    nombre: 'Pedro',
    apellido: 'Sánchez',
    email: 'pedro.sanchez@email.com',
    telefono: '0987654325',
    direccion: 'Calle Cuarta 654',
    ciudad: 'Ambato',
    provincia: 'Tungurahua',
    codigoPostal: '180101',
    activo: false,
    fechaRegistro: new Date('2023-09-12'),
    numeroOrdenes: 1,
    ultimaCompra: new Date('2025-06-20'),
    notas: 'Cliente inactivo desde hace varios meses'
  },
  {
    id: '6',
    cedula: '0967890123',
    nombre: 'Laura',
    apellido: 'Fernández',
    email: 'laura.fernandez@email.com',
    telefono: '0987654326',
    direccion: 'Av. Cuarta 987',
    ciudad: 'Riobamba',
    provincia: 'Chimborazo',
    codigoPostal: '060101',
    activo: true,
    fechaRegistro: new Date('2025-08-18'),
    numeroOrdenes: 1,
    ultimaCompra: new Date('2026-02-08'),
    notas: 'Cliente reciente, muy satisfecho con el servicio'
  }
];
