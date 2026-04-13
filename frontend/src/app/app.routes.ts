import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    //loadCHildren cargan los módulos solo cuando se accede a la ruta
    loadChildren: () =>
      import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('./employee/employee.module').then((m) => m.EmployeeModule),
  },
    {
    path: 'admin/dashboard',
    loadComponent: () =>
        import('./admin/dashboard/dashboard').then(m => m.AdminDashboard)
    },


  { path: '**', redirectTo: 'auth/login' },
];
