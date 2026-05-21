import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout';
import { AdminNavbarComponent } from './navbar/admin-navbar';
import { AdminDashboard } from './dashboard/dashboard';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin  from '@fullcalendar/interaction';
import  dayGridPlugin  from '@fullcalendar/daygrid';

@NgModule({
  declarations: [],
  imports: [CommonModule, AdminRoutingModule, AdminDashboard, FullCalendarModule],
})
export class AdminModule {}
