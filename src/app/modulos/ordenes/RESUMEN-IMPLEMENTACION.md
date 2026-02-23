# RESUMEN IMPLEMENTACIÓN - MÓDULO ÓRDENES DE TRABAJO (GESTIÓN DE REPARACIONES)

**Autores:** Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
**Fecha:** 23 de Febrero de 2026

**Estado:** ✅ Completado

---

## 📋 Requisitos Funcionales Implementados

### RF-ORD-01: Registrar Orden de Trabajo ✅

**Prioridad:** Alta

**Estado:** Completado

* ✓ Formulario de recepción de equipos exclusivo para Recepcionista y Administrador.
* ✓ Vinculación directa con el catálogo de clientes activos (permite acceso rápido a registrar un nuevo cliente si no existe).
* ✓ Registro de datos del equipo (Tipo, Marca, Modelo, Serie).
* ✓ Registro de Falla Reportada y Accesorios Recibidos.
* ✓ Generación automática de código único secuencial (Ej. `ORD-0001`).
* ✓ Asignación automática del estado inicial: **"Recibido"**.

**Componentes:** `formulario-orden.component.ts`

**Servicio:** `orden.servicio.ts`

---

### RF-ORD-02: Registrar Diagnóstico ✅

**Prioridad:** Alta

**Estado:** Completado - MEJORADO

* ✓ Interfaz dedicada para el Técnico (`diagnostico-tecnico.component`).
* ✓ **Asignación Automática:** Al iniciar el diagnóstico, el sistema captura y registra automáticamente el nombre del técnico logeado.
* ✓ Campo para detallar el Informe Técnico y daños reales encontrados.
* ✓ Campo para ingresar el **Presupuesto Estimado ($)** de la reparación para su posterior aprobación.
* ✓ Transición de estado a **"Diagnóstico"**.

**Componentes:** `diagnostico-tecnico.component.ts`

---

### RF-ORD-03: Agregar Repuestos/Servicios ✅

**Prioridad:** Alta

**Estado:** Completado

* ✓ Integración total con los catálogos del Módulo de Inventario.
* ✓ Selección dinámica de tipo de ítem (Repuesto Físico vs Servicio/Mano de Obra).
* ✓ Validación en tiempo real del stock disponible (impide agregar repuestos si no hay stock).
* ✓ **Cálculos Automáticos:** Multiplicación de Cantidad x Precio, suma de Subtotal y cálculo automático del **IVA (15%)** para generar el Total a Pagar.
* ✓ Opción para eliminar ítems agregados por error con recálculo instantáneo.

**Componentes:** `diagnostico-tecnico.component.ts`

**Servicio:** `orden.servicio.ts` → método `actualizarOrden()`

---

### RF-ORD-04: Actualizar Estado de Orden (Flujo de Vida) ✅

**Prioridad:** Alta

**Estado:** Completado - FLUJO REAL IMPLEMENTADO

Se implementó el ciclo de vida real de un taller, controlado por roles:

1. **Recibido** (Creada por Recepcionista).
2. **Diagnóstico** (Iniciado y presupuestado por el Técnico).
3. **Aprobación del Cliente** (Recepcionista usa botones de ✔ Aceptar o ✖ Cancelar).
4. **En Reparación** (Si es aceptado) / **Cancelado** (Si es rechazado).
5. **Listo** (Técnico finaliza la reparación).
6. **Entregado** (Recepcionista entrega el equipo y cobra).

**Componentes:** `lista-ordenes.component.ts`, `diagnostico-tecnico.component.ts`

---

### RF-ORD-05: Buscar Orden ✅

**Prioridad:** Alta

**Estado:** Completado

* ✓ Búsqueda omnicanal en una sola barra.
* ✓ Filtra instantáneamente por: Código de Orden (ORD-XXXX), Cédula del cliente, Nombre del cliente o Marca del equipo.
* ✓ Búsqueda reactiva (sin necesidad de recargar la página).

**Componentes:** `lista-ordenes.component.ts`

---

### RF-ORD-06: Listar Órdenes por Estado (Filtros) ✅

**Prioridad:** Media

**Estado:** Completado - CON REGLAS DE NEGOCIO

* ✓ Menú desplegable para filtrar visualmente las órdenes por su estado actual (Recibido, Diagnóstico, Listo, etc.).
* ✓ Tabla con indicadores visuales (Badges de colores) según el estado.
* ✓ **Regla de Negocio:** El Técnico **NO** puede ver las órdenes en estado "Cancelado" en su lista, manteniendo su cola de trabajo limpia. (Recepcionista y Admin sí las ven, con opacidad reducida).

**Componentes:** `lista-ordenes.component.ts`

---

### RF-ORD-07: Visualizar Detalle de Orden (Pre-factura) ✅

**Prioridad:** Alta

**Estado:** Completado

* ✓ Vista en formato de documento formal (hoja A4).
* ✓ Muestra la información cruzada: Cliente, Equipo, Diagnóstico, Presupuesto Estimado y Técnico Asignado.
* ✓ Tabla de consumos (repuestos y servicios) con Subtotal, IVA 15% y Total a Pagar.
* ✓ **Modo Impresión:** Estilos CSS (`@media print`) que ocultan los botones y el menú para imprimir un comprobante físico limpio para el cliente.

**Componentes:** `detalle-orden.component.ts`

---

## 🔐 Control de Acceso y Funciones por Rol

### Recepcionista

* ✓ Crea la Orden inicial (Recepción).
* ✓ **Aprobación:** Único rol que puede Aceptar o Cancelar el presupuesto tras comunicarse con el cliente.
* ✓ Entrega del equipo (Cambia estado a "Entregado").
* ✓ Visualización e impresión de Pre-factura.
* ✗ No puede editar el informe técnico ni agregar repuestos.

### Técnico

* ✓ Visualiza su cola de trabajo (excluyendo canceladas).
* ✓ Inicia el Diagnóstico y establece el presupuesto.
* ✓ Agrega repuestos y servicios a la orden.
* ✓ Marca el equipo como "Listo" cuando termina la reparación.
* ✗ No puede crear órdenes nuevas ni aprobar presupuestos ni entregar equipos.

### Administrador

* ✓ Acceso total de supervisión.
* ✓ Puede realizar las funciones tanto de recepcionista como de técnico en caso de emergencia.

---

## 🔄 Flujos de Trabajo (Ciclo Real)

### 1. Flujo de Recepción y Diagnóstico

1. **Recepcionista** hace clic en "+ Nueva Orden", selecciona al cliente, ingresa los datos del equipo y la falla reportada. La orden nace en **Recibido**.
2. **Técnico** ve la orden, hace clic en "Diagnosticar". El sistema captura su nombre, él ingresa el informe y el *Presupuesto Estimado* ($45). Hace clic en "Iniciar Diagnóstico". La orden pasa a **Diagnóstico**.

### 2. Flujo de Aprobación y Reparación

1. **Recepcionista** ve la orden en "Diagnóstico" y le aparece una sección especial de "Aprobación del Cliente".
2. Llama al cliente. Si el cliente no acepta, hace clic en "✖ Cancelar" (La orden muere en **Cancelado**).
3. Si el cliente acepta, hace clic en "✔ Aceptar". La orden pasa a **En Reparación**.
4. **Técnico** ve que ya está en reparación. Entra, consume los repuestos del inventario (validando stock) y hace clic en "✓ Marcar como Listo". La orden pasa a **Listo**.

### 3. Flujo de Entrega y Cobro

1. El cliente llega al local. **Recepcionista** entra a "Ver Detalle", imprime la pre-factura con el IVA del 15% aplicado.
2. Tras recibir el pago, en la lista hace clic en el botón verde "Entregar Equipo". La orden pasa a **Entregado** y el ciclo termina.

---

## 🛠️ Métodos del Servicio `OrdenServicio`

* `obtenerTodasLasOrdenes()` → Observable<OrdenTrabajo[]>
* `crearOrden(nuevaOrden)` → Genera ID, código y asocia cliente.
* `actualizarOrden(ordenAct)` → Calcula totales automáticamente (Subtotal, IVA 15%, Total).
* `cambiarEstado(id, nuevoEstado)` → Controla las transiciones y registra fechas de actualización/entrega.
* `buscarOrdenes(criterio)` → Motor de búsqueda integral.
* `asignarTecnico(id, tecnicoId, tecnicoNombre)`

---

## 📝 Datos de Prueba

Se incluyen 3 órdenes en `datos-ordenes-simulados.ts` para testear el sistema:

1. **ORD-0001 (Juan García):** Smartphone Samsung. Estado "En Reparación" con repuestos ya agregados (Cálculos de IVA activos).
2. **ORD-0002 (María López):** Laptop Dell. Estado "Recibido" (Lista para que un técnico la diagnostique).
3. **ORD-0003 (Ana Rodríguez):** Consola PS5. Estado "Listo" (Lista para que la recepcionista imprima detalle y entregue).

---

## ✅ Validaciones Implementadas

* ✓ **Validación de Integridad:** Un técnico no puede agregar más repuestos a una orden que el stock disponible en el inventario.
* ✓ **Cálculos Financieros:** IVA fijado en 15% y bloqueado contra manipulaciones manuales en frontend.
* ✓ **Flujo Lógico:** Los botones de acción cambian o desaparecen según el estado (Ej. El botón "Entregar" solo aparece si la orden está "Listo").
* ✓ **Auditoría:** Se guarda la fecha de recepción, de última actualización y de entrega final.

---

## 🔄 Integración con Otros Módulos

* **Módulo Clientes:** Consumo directo de `ClienteServicio` para asociar la orden a un usuario real.
* **Módulo Inventario:** Consumo de `RepuestoServicio` y `ServicioManoObraServicio` para cargar catálogos y validar stock.
* **Módulo Seguridad:** Uso de `AutenticacionServicio` para capturar el nombre del técnico logeado e inyectar permisos en el DOM (`*ngIf`).

---

## 🐛 Consideraciones de Desarrollo Futuro

1. **Módulo Seguimiento (Tracker):** Crear la vista pública donde el cliente, usando el código `ORD-XXXX`, pueda ver la línea de tiempo sin iniciar sesión (Módulo 5).
2. **Notificaciones Automáticas:** Conectar el método `cambiarEstado` con un servicio de envío de Emails para notificar al cliente (ej. "Su equipo está Listo").
3. **Descuento Físico de Stock:** Actualmente valida el stock, pero a futuro debe conectarse para restar permanentemente la cantidad del Módulo de Inventario al marcarse como "Listo".
4. **Módulo Caja:** Enlazar la acción de "Entregar Equipo" con la generación de un recibo contable para los reportes de ingresos.

---

## 📞 Contacto y Soporte

Para dudas técnicas sobre la gestión y el flujo de estados de las órdenes de trabajo:

* Pedro Andrés Avilés Baque
* Adiel Stalin López Moreno

**Fecha de última actualización:** 23 de Febrero de 2026