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
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
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
      next: (res: any) => this.empleados = res,
      error: (err) => console.error(err)
    });
  }

  // ============================
  // HORARIOS + CALENDARIO
  // ============================
  loadHorarios() {
    this.horariosService.getHorarios().subscribe({
      next: (res: any) => {
        this.horarios = res;

        // Cargar eventos en el calendario
        this.calendarOptions.events = this.horarios.map((h: any) => ({
          title: `${h.employee_name} (${h.start_time.slice(11,16)}-${h.end_time.slice(11,16)})`,
          start: h.start_time,
          end: h.end_time,
          color: this.getColorByEmpleado(h.employee_name)
        }));
      },
      error: (err) => console.error(err)
    });
  }

  getColorByEmpleado(nombre: string): string {
    const colores = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'];
    const index = Math.abs(nombre.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colores.length;
    return colores[index];
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
