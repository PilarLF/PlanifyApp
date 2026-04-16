import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeNavbar } from '../navbar/employee-navbar';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [RouterModule, EmployeeNavbar],
  templateUrl: './employee-layout.html',
  styleUrls: ['./employee-layout.scss']
})
export class EmployeeLayoutComponent {}
