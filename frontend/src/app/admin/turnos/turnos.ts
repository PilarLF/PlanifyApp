// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { FichajesService } from '../../employee/fichajes/fichajes';

// @Component({
//   selector: 'app-turnos',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './turnos.html',
//   styleUrls: ['./turnos.scss']
// })
// export class Turnos implements OnInit {

//   turnos: any[] = [];
//   loading = true;
//   filtered: any[] = [];

//   empleados: string[] = [];
//   filtroEmpleado = '';
//   filtroFecha = '';
//   filtroEstado = '';

//   constructor(private fichajesService: FichajesService) {}

//   ngOnInit() {
//     this.loadTurnos();
//   }

//   loadTurnos() {
//     this.fichajesService.getAllTurnos().subscribe({
//       next: (res) => {
//         this.turnos = res;
//         this.filtered = res;

//         this.empleados = [...new Set(res.map(t => t.employee_name))];
//       }
//     });
//   }
//   aplicarFiltros() {
//     this.filtered = this.turnos.filter(t => {
//       const porEmpleado = this.filtroEmpleado ? t.employee_name === this.filtroEmpleado : true;
//       const porFecha = this.filtroFecha ? t.start_time.startsWith(this.filtroFecha) : true;

//       const ahora = new Date();
//       const inicio = new Date(t.start_time);
//       const fin = new Date(t.end_time);

//       let porEstado = true;
//       if (this.filtroEstado === 'activo') porEstado = inicio <= ahora && fin >= ahora;
//       if (this.filtroEstado === 'finalizado') porEstado = fin < ahora;
//       if (this.filtroEstado === 'futuro') porEstado = inicio > ahora;

//       return porEmpleado && porFecha && porEstado;
//     });
//   }
// }
/**
 * admin/turnos/admin-turnos.ts
 *
 * Componente para el listado global de turnos (panel admin).
 * Combina datos de /api/horarios (con JOIN de empleados en backend)
 * y permite filtrar por empleado y rango de fechas.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Horarios } from '../horarios';
import { UserService } from '../../user/user';
import { FichajesService } from '../../employee/fichajes/fichajes';

@Component({
  selector: 'app-admin-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.scss']
})
export class Turnos implements OnInit {

  todosLosTurnos: any[] = [];
  empleados: any[] = [];

  filtroEmpleado = '';
  filtroDesde    = '';
  filtroHasta    = '';

  cargando = true;
  mensaje  = '';
  error    = '';

  constructor(
    private horariosService: Horarios,
    private fichajesService: FichajesService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarTurnos();
  }

  cargarEmpleados(): void {
    this.userService.getEmployees().subscribe({
      next: (res: any) => { this.empleados = res; },
      error: (err) => console.error('Error empleados:', err)
    });
  }

  cargarTurnos(): void {
    this.cargando = true;
    this.fichajesService.getAllTurnos().subscribe({
      next: (res: any) => {
        this.todosLosTurnos = res;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los turnos. Inténtalo de nuevo.';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  /** Lista filtrada según los controles de filtro */
  get turnosFiltrados(): any[] {
    return this.todosLosTurnos.filter(t => {
      const porEmpleado = !this.filtroEmpleado ||
        String(t.employee_id) === String(this.filtroEmpleado);

      const porDesde = !this.filtroDesde ||
        new Date(t.start_time) >= new Date(this.filtroDesde);

      const porHasta = !this.filtroHasta ||
        new Date(t.end_time) <= new Date(this.filtroHasta + 'T23:59:59');

      return porEmpleado && porDesde && porHasta;
    });
  }

  /** Calcula la duración en formato "Xh Ym" */
  getDuracion(start: string, end: string): string {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs <= 0) return '—';
    const h = Math.floor(diffMs / 3_600_000);
    const m = Math.floor((diffMs % 3_600_000) / 60_000);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  /** Iniciales para el avatar */
  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
  }

  /** Resetea los tres filtros */
  limpiarFiltros(): void {
    this.filtroEmpleado = '';
    this.filtroDesde    = '';
    this.filtroHasta    = '';
  }

  /** Elimina un turno con confirmación */
  eliminarTurno(id: string): void {
    if (!confirm('¿Eliminar este turno? Esta acción no se puede deshacer.')) return;

    this.horariosService.deleteHorario(id).subscribe({
      next: () => {
        this.mensaje = 'Turno eliminado correctamente';
        this.cargarTurnos();
        setTimeout(() => (this.mensaje = ''), 4000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al eliminar el turno';
        setTimeout(() => (this.error = ''), 4000);
      }
    });
  }
}