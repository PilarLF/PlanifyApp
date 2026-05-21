import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Horarios } from '../horarios';
import { UserService } from '../../user/user';

// FullCalendar
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class AdminDashboard {

  empleados: any[] = [];
  horarios: any[] = [];

  // FORMULARIO CREAR/EDITAR
  form = {
    employee_id: '',
    start_time: '',
    end_time: ''
  };

  editando: any = null;
  mensaje = '';
  error = '';

  // ============================
  // CALENDARIO
  // ============================
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: []
  };
  constructor(
    private horariosService: Horarios,
    private empleadosService: UserService
  ) {}

  ngOnInit() {
    this.loadEmpleados();
    this.loadHorarios();
  }

  // ============================
  // EMPLEADOS
  // ============================
  loadEmpleados() {
    this.empleadosService.getEmployees().subscribe({
      next: (res: any) => {
        this.empleados = res; this.loadHorarios(); // recarga horarios para mostrar nombres
      },
      error: (err) => console.error(err)
    });
  }

  // ============================
  // HORARIOS + CALENDARIO
  // ============================
loadHorarios() {
  this.horariosService.getHorarios().subscribe({
    next: (res: any) => {
      // Guardamos los horarios originales
      this.horarios = res;

      //  el join con empleados para sacar employee_name que falta en horarios
      const horariosConNombre = this.horarios.map((h: any) => {
        const empleado = this.empleados.find(e => e.id === h.employee_id);
        return {
          ...h,
          employee_name: empleado ? empleado.name : 'Sin asignar'
        };
      });

      //lista de la tabla
      this.horarios = horariosConNombre;

      // Cargamos los eventos en el calendario
      this.calendarOptions.events = horariosConNombre.map((h: any) => {
        const start = new Date(h.start_time);
        const end = new Date(h.end_time);

        return {
          title: `${h.employee_name} (${start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})})`,
          start,
          end,
          color: this.getColorByEmpleado(h.employee_name)
        };
      });
    },
    error: (err) => console.error(err)
  });
}


getColorByEmpleado(id: number): string {
  const colores = [
    '#6EC1E4', '#A3D977', '#F7B267', '#D67AB1', '#7DD3FC',
    '#FF9AA2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'
  ];

  return colores[id % colores.length];
}

  // ============================
  // CRUD TURNOS
  // ============================
  crearHorario() {
    this.mensaje = '';
    this.error = '';

    this.horariosService.createHorario(this.form).subscribe({
      next: () => {
        this.mensaje = 'Turno creado correctamente';
        this.loadHorarios();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear turno';
      }
    });
  }

  editar(h: any) {
    this.editando = { ...h };
  }

  guardarEdicion() {
    this.horariosService.updateHorario(this.editando.id, this.editando).subscribe({
      next: () => {
        this.mensaje = 'Turno actualizado';
        this.editando = null;
        this.loadHorarios();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar';
      }
    });
  }

  borrar(id: number) {
    if (!confirm('¿Eliminar turno?')) return;

    this.horariosService.deleteHorario(id.toString()).subscribe({
      next: () => {
        this.mensaje = 'Turno eliminado';
        this.loadHorarios();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al eliminar';
      }
    });
  }

}
