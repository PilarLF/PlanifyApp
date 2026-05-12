import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../auth/auth-guard';
import { AdminDashboard } from './dashboard/dashboard';
import { Turnos } from './turnos/turnos';
import { AdminLayoutComponent } from './layout/admin-layout';
import { adminGuard } from './admin-guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'turnos', component: Turnos },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
