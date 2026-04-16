import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Horarios } from '../horarios';
import { UserService } from '../../user/user';
import  dayGridPlugin  from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';

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

  form = {
    employee_id: '',
    start_time: '',
    end_time: ''
  };

  editando: any = null;
  mensaje = '';
  error = '';

  constructor(
    private horariosService: Horarios,
    private empleadosService: UserService
  ) {}

  ngOnInit() {
    this.loadEmpleados();
    this.loadHorarios();
  }

  loadEmpleados() {
    this.empleadosService.getEmployees().subscribe({
      next: (res: any) => this.empleados = res,
      error: (err) => console.error(err)
    });
  }

  loadHorarios() {
    this.horariosService.getHorarios().subscribe({
      next: (res: any) => this.horarios = res,
      error: (err) => console.error(err)
    });
  }

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
