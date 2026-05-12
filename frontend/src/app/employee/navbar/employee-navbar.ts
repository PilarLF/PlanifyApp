// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-employee-navbar',
//   standalone: true,
//   imports: [RouterModule],
//   templateUrl: './employee-navbar.html',
//   styleUrls: ['./employee-navbar.scss']
// })
// export class EmployeeNavbar{

//   logout() {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   }
// }
/**
 * employee/navbar/employee-navbar.ts
 * Navbar del panel de empleado con soporte de menú responsive.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-navbar.html',
  styleUrls: ['./employee-navbar.scss']
})
export class EmployeeNavbar {

  menuAbierto = false;

  toggleMenu(): void { this.menuAbierto = !this.menuAbierto; }
  cerrarMenu(): void  { this.menuAbierto = false; }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/auth/login';
  }
}