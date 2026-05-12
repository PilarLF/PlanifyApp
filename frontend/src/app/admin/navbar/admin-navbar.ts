// import { Component } from '@angular/core';
// import { RouterModule, RouterLinkActive } from '@angular/router';

// @Component({
//   selector: 'app-admin-navbar',
//   standalone: true,
//   imports: [RouterModule, RouterLinkActive],
//   templateUrl: './admin-navbar.html',
//   styleUrls: ['./admin-navbar.scss']
// })
// export class AdminNavbarComponent{

//   logout() {
//     localStorage.removeItem('token');
//     window.location.href = 'auth/login';
//   }
// }
/**
 * admin/navbar/admin-navbar.ts
 * Navbar del panel de administración.
 * Gestiona el menú hamburger para responsive y el skip link.
 */
import { Component } from '@angular/core';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.scss']
})
export class AdminNavbarComponent {

  /** Controla la visibilidad del menú en móvil */
  menuAbierto = false;

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/auth/login';
  }
}