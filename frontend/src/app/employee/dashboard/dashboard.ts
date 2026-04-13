import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichajesService } from '../fichajes/fichajes';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.html',
})
export class Dashboard implements OnInit {

  turnoActual: any = null;
  status: any = null;
  misTurnos: any[] = [];

  constructor(
    private fichajesService: FichajesService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
     this.loadTurnoActual();
    this.loadStatus();
    this.loadMisTurnos();
   
  }
  loadTurnoActual() {
    this.fichajesService.getTurnoActual().subscribe(res => {
      this.turnoActual = res;
      console.log("TURNO ACTUAL:", res);
    });
  }

  loadStatus() {
  this.fichajesService.getStatus().subscribe({
    next: (res) => {
      console.log('STATUS OK:', res);
      this.status = res;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('STATUS ERROR - status HTTP:', err.status);
      console.error('STATUS ERROR - mensaje:', err.error);
    }
  });
  }

  loadMisTurnos() {
    this.fichajesService.getMisTurnos().subscribe({
      next: (res: any[]) => {
        console.log('MIS TURNOS OK:', res);
        this.misTurnos = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('MIS TURNOS ERROR - status HTTP:', err.status);
        console.error('MIS TURNOS ERROR - mensaje:', err.error);
      }
    });   
  }
  

  clockIn() {
    if (!this.turnoActual) {
      alert("No tienes turno activo ahora mismo");
      return;
    }

    this.fichajesService.clockIn(this.turnoActual.id).subscribe(() => {
      this.loadStatus();
    });
  }

  clockOut() {
    this.fichajesService.clockOut().subscribe(() => this.loadStatus());
  }

  estaDentroDelTurno() {
  if (!this.turnoActual) return false;

  const now = new Date();
  return now >= new Date(this.turnoActual.start_time) &&
         now <= new Date(this.turnoActual.end_time);
}

}
