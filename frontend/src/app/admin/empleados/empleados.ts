/**
 * admin/empleados/empleados.ts
 *
 * Página de administración: listado de empleados.
 * Carga la lista de empleados y, de forma paralela, todos los
 * horarios para poder mostrar cuántos turnos tiene cada uno.
 * También permite desplegar un panel lateral con los turnos
 * individuales de cada empleado.
 *
 * WCAG 2.1 AA:
 *  - Mensajes de estado en aria-live regions (template)
 *  - getInitials() para avatares legibles por lectores
 *  - Focus gestionado al abrir/cerrar el panel lateral
 */
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../user/user';
import { Horarios } from '../horarios';

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrls: ['./empleados.scss']
})
export class AdminEmpleados implements OnInit {

  empleados: any[] = [];
  todosLosHorarios: any[] = [];
  turnosEmpleado: any[] = [];
  empleadoSeleccionado: any = null;

  filtro = '';
  cargando = true;
  mensaje = '';
  error = '';

  // Referencia para gestión de foco (WCAG 2.4.3)
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  constructor(
    private userService: UserService,
    private horariosService: Horarios
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /** Carga empleados y horarios en paralelo */
  cargarDatos(): void {
    this.cargando = true;

    // Empleados
    this.userService.getEmployees().subscribe({
      next: (res: any) => {
        this.empleados = res;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los empleados. Inténtalo de nuevo.';
        this.cargando = false;
        console.error(err);
      }
    });

    // Todos los horarios (para el contador de turnos)
    this.horariosService.getHorarios().subscribe({
      next: (res: any) => { this.todosLosHorarios = res; },
      error: (err) => console.error('Error cargando horarios:', err)
    });
  }

  /** Lista filtrada reactiva basada en el campo de búsqueda */
  get empleadosFiltrados(): any[] {
    if (!this.filtro.trim()) return this.empleados;
    const q = this.filtro.toLowerCase();
    return this.empleados.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  }

  /** Devuelve el número de turnos asignados a un empleado */
  getTurnosCount(employeeId: number): number {
    return this.todosLosHorarios.filter(h => h.employee_id === employeeId).length;
  }

  /**
   * Genera las iniciales del nombre para el avatar accesible.
   * Ej: "María García" → "MG"
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0]?.toUpperCase() ?? '')
      .join('');
  }

  /** Abre el panel lateral con los turnos del empleado */
  verTurnos(emp: any): void {
    this.empleadoSeleccionado = emp;
    this.turnosEmpleado = this.todosLosHorarios
      .filter(h => h.employee_id === emp.id)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    // Mueve el foco al botón de cierre del panel (WCAG 2.4.3)
    setTimeout(() => this.closeBtn?.nativeElement?.focus(), 50);
  }

  /** Cierra el panel lateral */
  cerrarPanel(): void {
    this.empleadoSeleccionado = null;
    this.turnosEmpleado = [];
  }
}