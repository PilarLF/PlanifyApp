import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../auth/auth-guard';
import { Dashboard } from './dashboard/dashboard';

const routes: Routes = [
  {
    //el modulo admin tiene solo un componente: su dashboard.
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
