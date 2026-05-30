// src/app/admin/admin-horarios.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Horarios } from '../../horarios';

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-horarios.html',
  styleUrl: './admin-horarios.scss',
})
export class AdminHorarios implements OnInit {
  form = {
    employee_id: '',
    start_time: '',
    end_time: '',
  };

  mensaje = '';
  error = '';
  horarios: any[] = [];        // inicializado como array
  editando: any = null;        // objeto en edición
  showEditForm = false;        // controla visibilidad del formulario de edición

  constructor(private horariosService: Horarios) {}

  ngOnInit() {
    this.loadHorarios();
  }

  loadHorarios() {
    this.horariosService.getHorarios().subscribe({
      next: (res: any) => {
        console.log('HORARIOS OK:', res);
        // Aseguramos que this.horarios sea un array
        this.horarios = Array.isArray(res) ? res : [];
      },
      error: (err: any) => {
        console.error('ERROR cargando horarios', err);
        this.error = err?.error?.message || 'Error cargando horarios';
      }
    });
  }


  crearHorario() {
    this.mensaje = '';
    this.error = '';

    this.horariosService.createHorario(this.form).subscribe({
      next: () => {
        this.mensaje = 'Turno creado correctamente';
        this.form = { employee_id: '', start_time: '', end_time: '' };
        this.loadHorarios(); // refrescar lista
      },
      error: (err) => {
        console.error('ERROR crearHorario', err);
        this.error = err?.error?.message || 'Error al crear turno';
      }
    });
  }

  // Inicia edición: clona el turno para editar sin mutar la lista hasta guardar
  startEdit(turno: any) {
    this.editando = { ...turno };
    this.showEditForm = true;
    this.mensaje = '';
    this.error = '';
  }

  // Cancela la edición
  cancelEdit() {
    this.editando = null;
    this.showEditForm = false;
  }

  // Guarda la edición actual
  guardarEdicion() {
    if (!this.editando || !this.editando.id) {
      this.error = 'No hay turno seleccionado para editar';
      return;
    }

    this.horariosService.updateHorario(this.editando.id, this.editando).subscribe({
      next: () => {
        this.mensaje = 'Horario actualizado correctamente';
        this.editando = null;
        this.showEditForm = false;
        this.loadHorarios();
      },
      error: (err) => {
        console.error('ERROR guardarEdicion', err);
        this.error = err?.error?.message || 'Error al actualizar';
      }
    });
  }

  // Borrar con confirmación
  borrar(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este turno?')) return;

    this.horariosService.deleteHorario(id).subscribe({
      next: () => {
        this.mensaje = 'Horario eliminado';
        this.loadHorarios();
      },
      error: (err) => {
        console.error('ERROR borrar', err);
        this.error = err?.error?.message || 'Error al eliminar';
      }
    });
  }

  // Método auxiliar para abrir edición desde plantilla (compatibilidad con nombres previos)
  editar(turno: any) {
    this.startEdit(turno);
  }
}
