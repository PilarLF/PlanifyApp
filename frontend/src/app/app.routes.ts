// import { Routes } from '@angular/router';
// import { EmployeeLayoutComponent } from './employee/layout/employee-layout';
// import { AdminLayoutComponent } from './admin/layout/admin-layout';
// import { authGuard } from './auth/auth-guard';
// import { adminGuard } from './admin/admin-guard';
// export const routes: Routes = [
//   { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

//   {
//     path: 'auth',
//     //loadCHildren cargan los módulos solo cuando se accede a la ruta
//     loadChildren: () =>
//       import('./auth/auth.module').then((m) => m.AuthModule),
//   },
//   // {
//   //   path: 'admin',
//   //   loadChildren: () =>
//   //     import('./admin/admin.module').then((m) => m.AdminModule),
//   // },
//   // {
//   //   path: 'employee',
//   //   loadChildren: () =>
//   //     import('./employee/employee.module').then((m) => m.EmployeeModule),
//   // },
//     // {
//     // path: 'admin/dashboard',
//     // loadComponent: () =>
//     //     import('./admin/dashboard/dashboard').then(m => m.AdminDashboard)
//     // },

//   {
//     path: 'employee',
//     component: EmployeeLayoutComponent,
//     canActivate: [authGuard],
//     children: [
//       {
//         path: 'dashboard',
//         loadComponent: () =>
//           import('./employee/dashboard/dashboard').then((m) => m.Dashboard)
//       },
//       {
//         path: '',
//         redirectTo: 'dashboard',
//         pathMatch: 'full'
//       }
//     ]
//   },
//   {
//     path: 'admin',
//     component: AdminLayoutComponent,
//     canActivate: [authGuard, adminGuard],
//     children: [
//       { path: 'dashboard', loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.AdminDashboard) },
//       { path: 'turnos', loadComponent: () => import('./admin/turnos/turnos').then(m => m.Turnos) },
//     //   { path: 'empleados', loadComponent: () => import('./admin/empleados/empleados.component').then(m => m.EmpleadosComponent) },
//      ]
//   },


//   { path: '**', redirectTo: 'auth/login' },

// ];

/**
 * app.routes.ts
 *
 * Cambios respecto a la versión anterior:
 *  - Añadida ruta /admin/empleados → AdminEmpleados
 *  - Añadida ruta /admin/turnos   → AdminTurnos
 *  - Ambas protegidas por authGuard + adminGuard
 *  - Lazy loading con loadComponent para mantener el bundle pequeño
 */
import { Routes } from '@angular/router';
import { EmployeeLayoutComponent } from './employee/layout/employee-layout';
import { AdminLayoutComponent }    from './admin/layout/admin-layout';
import { authGuard }               from './auth/auth-guard';
import { adminGuard }              from './admin/admin-guard';

export const routes: Routes = [

  // ── Raíz ────────────────────────────────────────────────────────────
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ── Autenticación ────────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },

  // ── Panel de empleado ────────────────────────────────────────────────
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./employee/dashboard/dashboard').then(m => m.Dashboard)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Panel de administración ──────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      // Dashboard principal
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then(m => m.AdminDashboard)
      },
      // NUEVO: listado de todos los empleados
      {
        path: 'empleados',
        loadComponent: () =>
          import('./admin/empleados/empleados').then(m => m.AdminEmpleados)
      },
      // NUEVO: listado global de turnos con filtros
      {
        path: 'turnos',
        loadComponent: () =>
          import('./admin/turnos/turnos').then(m => m.Turnos)
      },
      // Redirección por defecto al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Fallback ─────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' }
];