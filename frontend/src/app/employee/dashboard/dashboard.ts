import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichajesService } from '../fichajes/fichajes';
import dayGridPlugin  from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import esLocale from '@fullcalendar/core/locales/es';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: 'dashboard.html',
  styleUrls: ['dashboard.scss']
})
export class Dashboard implements OnInit {

  turnoActual: any = null;
  status: any = null;
  misTurnos: any[] = [];

  calendarOptions: any = {
  initialView: 'dayGridMonth',
  plugins: [dayGridPlugin],
  locale: esLocale, //que muestre el calendario en español
  events: []
  };

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
        //agrego los turnos del empleado al calendario de la libreria fullCalendar de Angular
            this.calendarOptions = {
              ...this.calendarOptions,
                events: this.misTurnos.map(t => ({
                  title: `${new Date(t.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          - 
                          ${new Date(t.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                  start: t.start_time,
                  end: t.end_time,
                  color: '#1A2060'
                }))
              };
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
