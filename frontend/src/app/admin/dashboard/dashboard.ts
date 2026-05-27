// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Horarios } from '../horarios';
// import { UserService } from '../../user/user';

// // FullCalendar
// import { FullCalendarModule } from '@fullcalendar/angular';
// import { CalendarOptions } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import esLocale from '@fullcalendar/core/locales/es';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
// import resourceCommonPlugin from '@fullcalendar/resource-common';
// import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule, FullCalendarModule],
//   templateUrl: './dashboard.html',
//   styleUrls: ['./dashboard.scss']
// })
// export class AdminDashboard {

//   empleados: any[] = [];
//   horarios: any[] = [];

//   // FORMULARIO CREAR/EDITAR
//   form = {
//     employee_id: '',
//     start_time: '',
//     end_time: ''
//   };

//   editando: any = null;
//   mensaje = '';
//   error = '';

//   // ============================
//   // CALENDARIO
//   // ============================
//   // calendarOptions: CalendarOptions = {
//   //   plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
//   //   initialView: 'timeGridWeek',
//   //   locale: esLocale,
//   //   headerToolbar: {
//   //     left: 'prev,next today',
//   //     center: 'title',
//   //     right: 'dayGridMonth,timeGridWeek,timeGridDay'
//   //   },
//   //   events: []
//   // };
//   calendarOptions: CalendarOptions = {
//     schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
//     plugins: [resourceTimeGridPlugin, interactionPlugin],
//     initialView: 'resourceTimeGridWeek',
//     locale: esLocale,
//     headerToolbar: {
//       left: 'prev,next today',
//       center: 'title',
//       right: 'resourceTimeGridDay,resourceTimeGridWeek'
//     },
//     resources: this.empleados.map(e => ({
//       id: e.id,
//       title: e.name
//     })),
//     events: this.horarios.map(h => ({
//       resourceId: h.employee_id,
//       start: h.start_time,
//       end: h.end_time,
//       title: `${h.employee_name}`
//     }))
//   };


//   constructor(
//     private horariosService: Horarios,
//     private empleadosService: UserService
//   ) {}

//   ngOnInit() {
//     this.loadEmpleados();
//     this.loadHorarios();
//   }

//   // ============================
//   // EMPLEADOS
//   // ============================
//   loadEmpleados() {
//     this.empleadosService.getEmployees().subscribe({
//       next: (res: any) => {
//         this.empleados = res; this.loadHorarios(); // recarga horarios para mostrar nombres
//       },
//       error: (err) => console.error(err)
//     });
//   }

//   // ============================
//   // HORARIOS + CALENDARIO
//   // ============================
// loadHorarios() {
//   this.horariosService.getHorarios().subscribe({
//     next: (res: any) => {
//       // Guardamos los horarios originales
//       this.horarios = res;

//       //  el join con empleados para sacar employee_name que falta en horarios
//       const horariosConNombre = this.horarios.map((h: any) => {
//         const empleado = this.empleados.find(e => e.id === h.employee_id);
//         return {
//           ...h,
//           employee_name: empleado ? empleado.name : 'Sin asignar'
//         };
//       });

//       //lista de la tabla
//       this.horarios = horariosConNombre;

//       // Cargamos los eventos en el calendario
//       this.calendarOptions.events = horariosConNombre.map((h: any) => {
//         const start = new Date(h.start_time);
//         const end = new Date(h.end_time);

//         return {
//           title: `${h.employee_name} (${start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})})`,
//           start,
//           end,
//           color: this.getColorByEmpleado(h.employee_name)
//         };
//       });
//     },
//     error: (err) => console.error(err)
//   });
// }


// getColorByEmpleado(id: number): string {
//   const colores = [
//     '#6EC1E4', '#A3D977', '#F7B267', '#D67AB1', '#7DD3FC',
//     '#FF9AA2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'
//   ];

//   return colores[id % colores.length];
// }

//   // ============================
//   // CRUD TURNOS
//   // ============================
//   crearHorario() {
//     this.mensaje = '';
//     this.error = '';

//     this.horariosService.createHorario(this.form).subscribe({
//       next: () => {
//         this.mensaje = 'Turno creado correctamente';
//         this.loadHorarios();
//       },
//       error: (err) => {
//         this.error = err.error?.message || 'Error al crear turno';
//       }
//     });
//   }

//   editar(h: any) {
//     this.editando = { ...h };
//   }

//   guardarEdicion() {
//     this.horariosService.updateHorario(this.editando.id, this.editando).subscribe({
//       next: () => {
//         this.mensaje = 'Turno actualizado';
//         this.editando = null;
//         this.loadHorarios();
//       },
//       error: (err) => {
//         this.error = err.error?.message || 'Error al actualizar';
//       }
//     });
//   }

//   borrar(id: number) {
//     if (!confirm('¿Eliminar turno?')) return;

//     this.horariosService.deleteHorario(id.toString()).subscribe({
//       next: () => {
//         this.mensaje = 'Turno eliminado';
//         this.loadHorarios();
//       },
//       error: (err) => {
//         this.error = err.error?.message || 'Error al eliminar';
//       }
//     });
//   }

// }
/**
 * admin/dashboard/dashboard.ts
 *
 * Panel de administración con grid semanal tipo Bizneo.
 * Elimina FullCalendar y usa una tabla HTML personalizada.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Horarios } from '../horarios';
import { UserService } from '../../user/user';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class AdminDashboard implements OnInit {

  empleados: any[] = [];
  horarios: any[] = [];

  cargando = true;
  showForm = false;
  mensaje = '';
  error = '';

  // ── Semana actual (array de 7 Date, lun-dom) ──────────────────────
  semanaActual: Date[] = [];
  private hoyBase = new Date();

  // ── Formulario crear turno ────────────────────────────────────────
  form = { employee_id: '', start_time: '', end_time: '' };

  constructor(
    private horariosService: Horarios,
    private empleadosService: UserService
  ) {
    this.setSemana(new Date());
  }

  ngOnInit() {
    this.loadEmpleados();
  }

  // ── Semana ────────────────────────────────────────────────────────

  /** Construye los 7 días (lun-dom) de la semana que contiene `fecha` */
  private setSemana(fecha: Date): void {
    const lunes = new Date(fecha);
    const dow = lunes.getDay(); // 0=dom,1=lun…
    const diffLunes = dow === 0 ? -6 : 1 - dow;
    lunes.setDate(lunes.getDate() + diffLunes);
    lunes.setHours(0, 0, 0, 0);

    this.semanaActual = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }

  semanaAnterior(): void {
    const ref = new Date(this.semanaActual[0]);
    ref.setDate(ref.getDate() - 7);
    this.setSemana(ref);
  }

  semanaSiguiente(): void {
    const ref = new Date(this.semanaActual[0]);
    ref.setDate(ref.getDate() + 7);
    this.setSemana(ref);
  }

  semanaActualHoy(): void {
    this.setSemana(new Date());
  }

  // ── Helpers de fecha ──────────────────────────────────────────────

  esHoy(dia: Date): boolean {
    const hoy = new Date();
    return dia.toDateString() === hoy.toDateString();
  }

  esFinDeSemana(dia: Date): boolean {
    return dia.getDay() === 0 || dia.getDay() === 6;
  }

  /** Turnos de un empleado en un día concreto */
  getTurnosDelDia(employeeId: number, dia: Date): any[] {
    return this.horarios.filter(h => {
      if (h.employee_id !== employeeId) return false;
      const inicio = new Date(h.start_time);
      return inicio.toDateString() === dia.toDateString();
    });
  }

  /** Horas totales del empleado en la semana visible */
  getHorasSemanales(employeeId: number): number {
    return this.semanaActual.reduce((total, dia) => {
      const turnos = this.getTurnosDelDia(employeeId, dia);
      return total + turnos.reduce((sum, t) => {
        const ms = new Date(t.end_time).getTime() - new Date(t.start_time).getTime();
        return sum + ms / 3_600_000;
      }, 0);
    }, 0);
  }

  /** Total de turnos en la semana visible (para KPI) */
  get totalTurnosSemana(): number {
    return this.semanaActual.reduce((total, dia) =>
      total + this.horarios.filter(h => {
        const inicio = new Date(h.start_time);
        return inicio.toDateString() === dia.toDateString();
      }).length, 0);
  }

  /** Suma de horas de todos los turnos de la semana visible */
  get totalHorasSemana(): number {
    const semanaSet = new Set(this.semanaActual.map(d => d.toDateString()));
    const horas = this.horarios
      .filter(h => semanaSet.has(new Date(h.start_time).toDateString()))
      .reduce((sum, h) => {
        const ms = new Date(h.end_time).getTime() - new Date(h.start_time).getTime();
        return sum + ms / 3_600_000;
      }, 0);
    return Math.round(horas);
  }

  /** Duración en formato "Xh" o "Xh Ym" */
  getDuracion(start: string, end: string): string {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms <= 0) return '—';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  /** Iniciales para avatar */
  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
  }

  // ── Carga de datos ────────────────────────────────────────────────

  loadEmpleados(): void {
    this.empleadosService.getEmployees().subscribe({
      next: (res: any) => {
        this.empleados = res;
        this.loadHorarios();
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  loadHorarios(): void {
    this.cargando = true;
    this.horariosService.getHorarios().subscribe({
      next: (res: any) => {
        this.horarios = Array.isArray(res) ? res : [];
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // ── Formulario ────────────────────────────────────────────────────

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.mensaje = '';
    this.error = '';
  }

  crearHorario(): void {
    this.mensaje = '';
    this.error = '';

    this.horariosService.createHorario(this.form).subscribe({
      next: () => {
        this.mensaje = 'Turno creado correctamente';
        this.form = { employee_id: '', start_time: '', end_time: '' };
        this.loadHorarios();
        setTimeout(() => (this.mensaje = ''), 3000);
      },
      error: (err) => {
      // 2. Log para depurar en consola 
      console.error("DEBUG: Error capturado en el front:", err);
      
      // 3. Forzar el refresco del mensaje
      const errorMsg = err.error?.message || 'Error al crear turno';
      
      //  que el DOM reaccione si el error es el mismo
      this.error = ''; 
      setTimeout(() => {
        this.error = errorMsg;
      }, 10);
    }
  });
  }

}