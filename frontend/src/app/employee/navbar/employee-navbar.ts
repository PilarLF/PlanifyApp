import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './employee-navbar.html',
  styleUrls: ['./employee-navbar.scss']
})
export class EmployeeNavbar{

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
