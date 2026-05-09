import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichajesService } from '../../employee/fichajes/fichajes';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.scss']
})
export class Turnos implements OnInit {

  turnos: any[] = [];
  loading = true;
  filtered: any[] = [];

  empleados: string[] = [];
  filtroEmpleado = '';
  filtroFecha = '';
  filtroEstado = '';

  constructor(private fichajesService: FichajesService) {}

  ngOnInit() {
    this.loadTurnos();
  }

  loadTurnos() {
    this.fichajesService.getAllTurnos().subscribe({
      next: (res) => {
        this.turnos = res;
        this.filtered = res;

        this.empleados = [...new Set(res.map(t => t.employee_name))];
      }
    });
  }
  aplicarFiltros() {
    this.filtered = this.turnos.filter(t => {
      const porEmpleado = this.filtroEmpleado ? t.employee_name === this.filtroEmpleado : true;
      const porFecha = this.filtroFecha ? t.start_time.startsWith(this.filtroFecha) : true;

      const ahora = new Date();
      const inicio = new Date(t.start_time);
      const fin = new Date(t.end_time);

      let porEstado = true;
      if (this.filtroEstado === 'activo') porEstado = inicio <= ahora && fin >= ahora;
      if (this.filtroEstado === 'finalizado') porEstado = fin < ahora;
      if (this.filtroEstado === 'futuro') porEstado = inicio > ahora;

      return porEmpleado && porFecha && porEstado;
    });
  }
}
