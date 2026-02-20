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

export const routes: Routes = [
  // RUTAS PÚBLICAS
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Iniciar Sesión' }
  },

  // DASHBOARD PRINCIPAL (PROTEGIDO)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [autenticacionGuard],
    data: { title: 'Panel de Control' }
  },

  // DASHBOARDS ESPECÍFICOS POR ROL (PROTEGIDOS)
  {
    path: 'dashboard',
    children: [
      {
        path: 'administrador',
        component: AdministradorDashboardComponent,
        canActivate: [administradorGuard],
        data: { title: 'Panel de Administrador' }
      },
      {
        path: 'recepcionista',
        component: RecepcionistaDashboardComponent,
        canActivate: [recepcionstaGuard],
        data: { title: 'Panel de Recepcionista' }
      },
      {
        path: 'tecnico',
        component: TecnicoDashboardComponent,
        canActivate: [tecnicoGuard],
        data: { title: 'Panel de Técnico' }
      }
    ]
  },

  // MÓDULO DE CLIENTES (PROTEGIDO)
  {
    path: 'clientes',
    children: [
      {
        path: '',
        component: ListaClientesComponent,
        canActivate: [ClientesGuard],
        data: { title: 'Gestión de Clientes' }
      },
      {
        path: 'nuevo',
        component: FormularioClienteComponent,
        canActivate: [ClientesGuard],
        data: { title: 'Nuevo Cliente' }
      },
      {
        path: 'editar/:id',
        component: FormularioClienteComponent,
        canActivate: [ClientesGuard],
        data: { title: 'Editar Cliente' }
      }
    ]
  },

  // REDIRECCIÓN POR DEFECTO
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

