# RESUMEN IMPLEMENTACIÓN - MÓDULO SEGURIDAD

**Autores:** Pedro Andrés Avilés Baque, Adiel Stalin López Moreno
**Fecha:** 20 de Febrero de 2026  
**Estado:** ✅ Completado

---

## 📋 Requisitos Funcionales Implementados

### RF-SEG-01: Inicio de Sesión (Login) ✅
**Prioridad:** Alta  
**Estado:** Completado

- ✓ Formulario de ingreso con credenciales (Usuario y Contraseña)
- ✓ Validación estricta de campos vacíos y longitud de contraseña (mínimo 5 caracteres)
- ✓ Opción para visualizar/ocultar contraseña
- ✓ Autenticación simulada contra base de datos en memoria
- ✓ Generación de token único de sesión (`tkn_...`)
- ✓ Persistencia de sesión mediante `localStorage` con expiración de 24 horas
- ✓ Redirección automática al dashboard correspondiente según el rol
- ✓ Botones de acceso rápido para demostración (Admin, Recepción, Técnico)

**Componentes:** `login.component.ts`  
**Servicio:** `autenticacion.servicio.ts`

---

### RF-SEG-02: Gestión de Usuarios (Crear) ✅
**Prioridad:** Alta  
**Estado:** Completado

- ✓ Formulario exclusivo para el Administrador
- ✓ Campos requeridos: Nombre, Apellido, correo, Rol, Usuario y Contraseña
- ✓ Asignación dinámica de roles (Administrador, Recepcionista, Técnico)
- ✓ Generación automática de ID, fecha de creación y estado activo
- ✓ Redirección a la lista de usuarios tras el guardado exitoso

**Componentes:** `administrador-dashboard.component.ts`  
**Servicio:** `usuario.servicio.ts`

---

### RF-SEG-03: Gestión de Usuarios (Editar) ✅
**Prioridad:** Alta  
**Estado:** Completado

- ✓ Carga automática de los datos del usuario a editar
- ✓ Modificación de información personal y Rol
- ✓ Preservación del nombre de usuario original (no editable por seguridad)
- ✓ Opción de cambiar contraseña o dejarla en blanco para mantener la actual
- ✓ Botón especial para "Resetear Contraseña" a un valor temporal por defecto (`temporal123`)

**Componentes:** `administrador-dashboard.component.ts`  

---

### RF-SEG-04: Gestión de Usuarios (Eliminar/Inactivar) ✅
**Prioridad:** Media  
**Estado:** Completado

- ✓ Implementación de borrado lógico (Soft Delete: Activo/Inactivo) 
- ✓ Mensaje de confirmación nativo antes de desactivar 
- ✓ Cambio de estado visual (badges verde/rojo) en la tabla de usuarios 
- ✓ Prevención de inicio de sesión para usuarios inactivos

**Componentes:** `administrador-dashboard.component.ts`  
**Servicio:** `autenticacion.servicio.ts` → método `validarCredenciales()`

---

### RF-SEG-05: Búsqueda de Usuarios ✅
**Prioridad:** Media  
**Estado:** Completado

- ✓ Búsqueda reactiva en tiempo real (sin botón de submit)
- ✓ Filtrado multicriterio: por Nombre, Apellido o Nombre de Usuario
- ✓ Actualización instantánea de la tabla de resultados
- ✓ Mensaje de "No hay usuarios que coincidan" cuando la búsqueda es vacía

**Componentes:** `administrador-dashboard.component.ts`  

---

### RF-SEG-06: Control de Acceso por Roles ✅
**Prioridad:** Alta  
**Estado:** Completado

- ✓ Protección de rutas mediante Angular Guards (`CanActivateFn`)
- ✓ `autenticacionGuard`: Bloquea rutas si no hay sesión activa
- ✓ `rolGuard`: Verifica el array de roles permitidos en las rutas
- ✓ `dashboard.guard.ts`: Tres guards específicos (`administradorGuard`, `recepcionstaGuard`, `tecnicoGuard`) para aislar los paneles de control
- ✓ Redirección inteligente de intrusos al Login o a su Dashboard asignado

**Archivos:** `autenticacion.guard.ts`, `dashboard.guard.ts`

---

### RF-SEG-07: Cierre de Sesión (Logout) ✅
**Prioridad:** Alta  
**Estado:** Completado

- ✓ Botón de cierre de sesión presente en todos los Dashboards
- ✓ Limpieza profunda de `BehaviorSubject` en los servicios
- ✓ Eliminación segura de tokens y datos de usuario del `localStorage`
- ✓ Redirección forzada e inmediata a la pantalla de Login

**Componentes:** Dashboards y `login.component.ts`  
**Servicio:** `autenticacion.servicio.ts` → método `cerrarSesion()`

---

## 🔐 Control de Acceso del Módulo

### Administrador
- ✓ Acceso total al panel de Gestión de Usuarios
- ✓ Capacidad para crear, editar, buscar y desactivar cuentas
- ✓ Restablecimiento de contraseñas de su personal

### Recepcionista / Técnico
- ✓ Iniciar sesión en sus respectivos perfiles
- ✓ Cerrar sesión
- ✗ Acceso denegado a la gestión de usuarios (exclusivo admin)

---

## 🔄 Flujos de Trabajo

### Flujo: Inicio de Sesión
1. Usuario accede a `/login`
2. El sistema verifica si hay una sesión guardada vigente (< 24h). Si es así, auto-loguea.
3. Si no hay sesión, usuario ingresa credenciales.
4. `AutenticacionServicio` valida contra la base de datos simulada y que el usuario esté "Activo".
5. Si falla: Muestra mensaje de error sin recargar.
6. Si pasa: Genera token `tkn_...`, guarda en `localStorage` y redirige al dashboard correspondiente al rol.

### Flujo: Gestión de Usuarios (Admin)
1. Administrador accede a su Dashboard.
2. Clic en "+ Nuevo Usuario" o "Editar" en la tabla.
3. Completa/Modifica los datos del formulario.
4. El sistema valida campos requeridos.
5. Se guarda el registro en el `UsuarioServicio`.
6. La tabla se actualiza y los contadores (Total, Activos, Inactivos) se recalculan.

### Flujo: Protección de Rutas (Guards)
1. Usuario intenta acceder por URL a `/dashboard/admin`.
2. Angular intercepta la petición y ejecuta `administradorGuard`.
3. El Guard pide al servicio el rol del usuario actual.
4. Si es técnico o recepcionista, bloquea el paso y lo devuelve a su propio dashboard.
5. Si no está logueado, lo expulsa a `/login`.

---

## 🛠️ Métodos del Servicio AutenticacionServicio

### Sesión y Validación
- `autenticar(nombreUsuario, contrasena)` → Observable<RespuestaAutenticacion>
- `cerrarSesion()` → void
- `validarCredenciales(nombreUsuario, contrasena)` → Usuario | null (Privado)
- `verificarSesionGuardada()` → void (Comprueba caducidad de 24h)

### Obtención de Datos
- `obtenerUsuarioActual()` → Usuario | null
- `obtenerSesionActual()` → SesionUsuario | null

### Observables (Estado Global)
- `usuarioAutenticado$` (BehaviorSubject)
- `sesionActiva$` (BehaviorSubject)

---

## 📝 Datos de Prueba

El sistema cuenta con usuarios pre-cargados para pruebas rápidas:
1. **Administrador:** `admin` / `admin123`
2. **Recepcionista:** `recepcion` / `recep123`
3. **Técnico:** `tecnico1` / `tech123`

---

## ✅ Validaciones Implementadas

### Seguridad de Formularios
- ✓ Usuario no está vacío
- ✓ Contraseña no está vacía y tiene mínimo 5 caracteres
- ✓ Selección de rol obligatoria al crear usuario

### Seguridad del Sistema
- ✓ Generación de Tokens de sesión aleatorios (`Math.random()`)
- ✓ Expiración de sesión por tiempo (24 horas matemáticas)
- ✓ Control de estado "Activo": un usuario desactivado no puede hacer login aunque sus credenciales sean correctas.
- ✓ Aislamiento estricto de rutas por rol.

---

## 🔄 Integración con Otros Módulos

### Dependencias
- **Módulo Global:** Todos los módulos del sistema (Clientes, Órdenes, Inventario) dependen del `AutenticacionServicio` y del `UsuarioActual` para determinar qué botones mostrar, qué campos bloquear y a qué rutas permitir el acceso.

---

## 🐛 Consideraciones de Desarrollo Futuro

1. **Tokens Reales (JWT):** Reemplazar la generación de tokens simulada por Json Web Tokens emitidos por un backend real.
2. **Cifrado de Contraseñas:** Implementar `bcrypt` o similar en el backend para no almacenar contraseñas en texto plano.
3. **Recuperación de Contraseña:** Añadir flujo de "¿Olvidaste tu contraseña?" mediante envío de correos electrónicos.
4. **Bloqueo por Intentos:** Implementar bloqueo temporal de cuenta tras 3 o 5 intentos fallidos de inicio de sesión.
5. **Permisos Granulares:** Evolucionar del control por "Roles" generales a un modelo de "Permisos" específicos (ej: `CAN_DELETE_CLIENT`, `CAN_CREATE_ORDER`).

---

## 📞 Contacto y Soporte

Para preguntas o problemas con el módulo de seguridad, contactar a los autores:
- Pedro Andrés Avilés Baque
- Adiel Stalin López Moreno

**Fecha de última actualización:** 20 de Febrero de 2026