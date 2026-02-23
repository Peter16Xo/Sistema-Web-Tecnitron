import { Routes } from '@angular/router';
import { LoginComponent } from './modulos/seguridad/componentes/login/login.component';
import { DashboardComponent } from './modulos/seguridad/componentes/dashboard/dashboard.component';
import { AdministradorDashboardComponent } from './modulos/seguridad/componentes/administrador-dashboard/administrador-dashboard.component';
import { RecepcionistaDashboardComponent } from './modulos/seguridad/componentes/recepcionista-dashboard/recepcionista-dashboard.component';
import { TecnicoDashboardComponent } from './modulos/seguridad/componentes/tecnico-dashboard/tecnico-dashboard.component';
import { autenticacionGuard } from './modulos/seguridad/guards/autenticacion.guard';
import { administradorGuard, recepcionstaGuard, tecnicoGuard } from './modulos/seguridad/guards/dashboard.guard';
import { ListaClientesComponent } from './modulos/clientes/componentes/lista-clientes/lista-clientes.component';
import { FormularioClienteComponent } from './modulos/clientes/componentes/formulario-cliente/formulario-cliente.component';
import { ClientesGuard } from './modulos/clientes/guards/clientes.guard';
import { ListaServiciosComponent } from './modulos/inventario/componentes/servicios-mano-obra/lista-servicios/lista-servicios.component';

// --- IMPORTACIONES DEL MÓDULO INVENTARIO ---
import { ListaRepuestosComponent } from './modulos/inventario/componentes/repuestos/lista-repuestos/lista-repuestos.component';
import { FormularioRepuestoComponent } from './modulos/inventario/componentes/repuestos/formulario-repuesto/formulario-repuesto.component';
import { FormularioServicioComponent } from './modulos/inventario/componentes/servicios-mano-obra/formulario-servicio/formulario-servicio.component';

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
  {
    path: 'clientes',
    children: [
      { path: '', component: ListaClientesComponent, canActivate: [ClientesGuard] },
      { path: 'nuevo', component: FormularioClienteComponent, canActivate: [ClientesGuard] },
      { path: 'editar/:id', component: FormularioClienteComponent, canActivate: [ClientesGuard] }
    ]
  },
  
  // --- RUTAS DE INVENTARIO ---
  {
    path: 'inventario',
    children: [
      { path: '', redirectTo: 'listar-repuestos', pathMatch: 'full' },
      { path: 'listar-repuestos', component: ListaRepuestosComponent },
      { path: 'repuestos/nuevo', component: FormularioRepuestoComponent },
      { path: 'repuestos/editar/:id', component: FormularioRepuestoComponent },
      { path: 'registrar-servicio', component: FormularioServicioComponent },
      { path: 'servicios', component: ListaServiciosComponent },
      { path: 'servicios/editar/:id', component: FormularioServicioComponent, data: { title: 'Editar Servicio' }
      }
    ]
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];