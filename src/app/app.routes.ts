import { Routes } from '@angular/router';
import { LoginComponent } from './modulos/seguridad/componentes/login/login.component';
import { DashboardComponent } from './modulos/seguridad/componentes/dashboard/dashboard.component';
import { AdministradorDashboardComponent } from './modulos/seguridad/componentes/administrador-dashboard/administrador-dashboard.component';
import { RecepcionistaDashboardComponent } from './modulos/seguridad/componentes/recepcionista-dashboard/recepcionista-dashboard.component';
import { TecnicoDashboardComponent } from './modulos/seguridad/componentes/tecnico-dashboard/tecnico-dashboard.component';
import { autenticacionGuard } from './modulos/seguridad/guards/autenticacion.guard';
import { administradorGuard, recepcionstaGuard, tecnicoGuard } from './modulos/seguridad/guards/dashboard.guard';

// --- IMPORTACIONES CLIENTES ---
import { ListaClientesComponent } from './modulos/clientes/componentes/lista-clientes/lista-clientes.component';
import { FormularioClienteComponent } from './modulos/clientes/componentes/formulario-cliente/formulario-cliente.component';
import { ClientesGuard } from './modulos/clientes/guards/clientes.guard';

// --- IMPORTACIONES INVENTARIO ---
import { ListaRepuestosComponent } from './modulos/inventario/componentes/repuestos/lista-repuestos/lista-repuestos.component';
import { FormularioRepuestoComponent } from './modulos/inventario/componentes/repuestos/formulario-repuesto/formulario-repuesto.component';
import { ListaServiciosComponent } from './modulos/inventario/componentes/servicios-mano-obra/lista-servicios/lista-servicios.component';
import { FormularioServicioComponent } from './modulos/inventario/componentes/servicios-mano-obra/formulario-servicio/formulario-servicio.component';

// --- IMPORTACIONES ÓRDENES ---
import { ListaOrdenesComponent } from './modulos/ordenes/componentes/lista-ordenes/lista-ordenes.component';
import { FormularioOrdenComponent } from './modulos/ordenes/componentes/formulario-orden/formulario-orden.component';
import { DetalleOrdenComponent } from './modulos/ordenes/componentes/detalle-orden/detalle-orden.component';
import { DiagnosticoTecnicoComponent } from './modulos/ordenes/componentes/diagnostico-tecnico/diagnostico-tecnico.component';
import { ordenesGuard } from './modulos/ordenes/guards/ordenes.guard'; // Tu nuevo guard

export const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: 'Iniciar Sesión' } },
  { path: 'dashboard', component: DashboardComponent, canActivate: [autenticacionGuard] },
  { 
    path: 'dashboard', 
    children: [
      { path: 'administrador', component: AdministradorDashboardComponent, canActivate: [administradorGuard] },
      { path: 'recepcionista', component: RecepcionistaDashboardComponent, canActivate: [recepcionstaGuard] },
      { path: 'tecnico', component: TecnicoDashboardComponent, canActivate: [tecnicoGuard] }
    ]
  },
  
  // --- RUTAS CLIENTES ---
  {
    path: 'clientes',
    children: [
      { path: '', component: ListaClientesComponent, canActivate: [ClientesGuard] },
      { path: 'nuevo', component: FormularioClienteComponent, canActivate: [ClientesGuard] },
      { path: 'editar/:id', component: FormularioClienteComponent, canActivate: [ClientesGuard] }
    ]
  },
  
  // --- RUTAS INVENTARIO ---
  {
    path: 'inventario',
    children: [
      { path: '', redirectTo: 'listar-repuestos', pathMatch: 'full' },
      { path: 'listar-repuestos', component: ListaRepuestosComponent },
      { path: 'repuestos/nuevo', component: FormularioRepuestoComponent },
      { path: 'repuestos/editar/:id', component: FormularioRepuestoComponent },
      { path: 'registrar-servicio', component: FormularioServicioComponent },
      { path: 'servicios', component: ListaServiciosComponent },
      { path: 'servicios/editar/:id', component: FormularioServicioComponent, data: { title: 'Editar Servicio' } }
    ]
  },

  // --- RUTAS ÓRDENES DE TRABAJO ---
  {
    path: 'ordenes',
    // Si tu guard aún no tiene lógica, puedes quitar esta línea de canActivate por ahora para que no te bloquee:
    // canActivate: [ordenesGuard], 
    children: [
      { path: '', component: ListaOrdenesComponent },
      { path: 'nueva', component: FormularioOrdenComponent },
      { path: 'detalle/:id', component: DetalleOrdenComponent },
      { path: 'diagnostico/:id', component: DiagnosticoTecnicoComponent }
    ]
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];