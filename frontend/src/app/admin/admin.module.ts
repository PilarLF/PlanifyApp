import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout';
import { AdminNavbarComponent } from './navbar/admin-navbar';
import { AdminDashboard } from './dashboard/dashboard';


@NgModule({
  declarations: [],
  imports: [CommonModule, AdminRoutingModule, AdminDashboard],
})
export class AdminModule {}
