import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Horarios } from '../../horarios';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-horarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.scss',
})
export class AdminHorarios {
editar(_t43: any) {
throw new Error('Method not implemented.');
}
  form= {
    employee_id: '',
    start_time: '',
    end_time: '',
  };
  mensaje: string = '';
  error: string = '';
  horarios: any;
  editando: any=null;

  constructor(private horariosService: Horarios) {}

  ngOnInit() {
    this.loadHorarios();
  }

  loadHorarios() {
    this.horariosService.getHorarios().subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  crearHorario() {
    this.mensaje = '';
    this.error = '';

    this.horariosService.createHorario(this.form).subscribe({
      next: () => {
        this.mensaje = 'Turno creado correctamente';
        this.loadHorarios(); // refrescar lista
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear turno';
      }
    });
  }

  guardarEdicion() {
    this.horariosService.updateHorario(this.editando.id, this.editando).subscribe({
      next: () => {
        this.mensaje = 'Horario actualizado correctamente';
        this.editando = null;
        this.loadHorarios();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar';
      }
    });
  }

  borrar(id: string) {
  if (!confirm('¿Seguro que quieres eliminar este turno?')) return;

  this.horariosService.deleteHorario(id).subscribe({
    next: () => {
      this.mensaje = 'Horario eliminado';
      this.loadHorarios();
    },
    error: (err) => {
      this.error = err.error?.message || 'Error al eliminar';
    }
  });
}


}
