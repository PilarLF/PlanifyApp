import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { Dashboard } from './dashboard/dashboard';

@NgModule({
  declarations: [],
  imports: [CommonModule, EmployeeRoutingModule, Dashboard],
})
export class EmployeeModule {}
