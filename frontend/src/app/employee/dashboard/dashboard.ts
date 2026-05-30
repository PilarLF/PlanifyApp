// src/app/employee/dashboard/dashboard.ts
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichajesService } from '../fichajes/fichajes';
import dayGridPlugin  from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import esLocale from '@fullcalendar/core/locales/es';
import { NamedTimeZoneImpl } from '@fullcalendar/core/internal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: 'dashboard.html',
  styleUrls: ['dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy {

  turnoActual: any = null;
  status: any = null;
  misTurnos: any[] = [];
  mensajeError: string | null = null;

  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    locale: esLocale,
    timeZone: 'UTC',
    events: []
  };

  /** Reloj */
  currentTime: string = '';
  private clockIntervalId?: number;

  constructor(
    private fichajesService: FichajesService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTurnoActual();
    this.loadStatus();
    this.loadMisTurnos();
    this.startClock();
  }

  ngOnDestroy() {
    this.stopClock();
  }

  /* ---------- Clock helpers ---------- */
  private startClock() {
    this.updateClock(); // primera actualización inmediata
    // window.setInterval devuelve number en navegador
    this.clockIntervalId = window.setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  private stopClock() {
    if (this.clockIntervalId !== undefined) {
      window.clearInterval(this.clockIntervalId);
      this.clockIntervalId = undefined;
    }
  }

  private updateClock() {
    const now = new Date();
    // Formato local; puedes personalizar con toLocaleTimeString opciones
    this.currentTime = now.toLocaleTimeString();
    // Forzar detección por si el componente usa OnPush o no detecta automáticamente
    try { this.cdr.detectChanges(); } catch { /* no-op si no es necesario */ }
  }

  /* ---------- Carga de datos ---------- */
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
        this.calendarOptions = {
          ...this.calendarOptions,
            events: this.misTurnos.map(t => {
              const start = new Date(t.start_time);
              const end = new Date(t.end_time);
              // Formatear en UTC para que coincida con lo que muestra la pipe
              const startHora = start.toISOString().slice(11, 16);
              const endHora = end.toISOString().slice(11, 16);
              return {
                title: `${startHora} - ${endHora}`,
                start: t.start_time,  
                end: t.end_time,
                color: '#1A2060'
              };
            })
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('MIS TURNOS ERROR - status HTTP:', err.status);
        console.error('MIS TURNOS ERROR - mensaje:', err.error);
      }
    });
  }

  /* ---------- Fichajes ---------- */
  clockIn() {
    if (!this.turnoActual) {
      this.mensajeError = "No tienes turno activo ahora mismo";
      setTimeout(() => this.mensajeError = null, 3000);
      return;
    }
    this.fichajesService.clockIn(this.turnoActual.id).subscribe({
      next: () => this.loadStatus(),
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al fichar entrada';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    });
  }

  clockOut() {
    this.fichajesService.clockOut().subscribe({
      next: () => this.loadStatus(),
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al fichar salida';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    });
  }

    estaDentroDelTurno(): boolean {
      if (!this.turnoActual) return false;
      const nowUtc = Date.now(); // ms desde epoch, igual en UTC y local
      const startUtc = new Date(this.turnoActual.start_time).getTime();
      const endUtc = new Date(this.turnoActual.end_time).getTime();
      return nowUtc >= startUtc && nowUtc <= endUtc;
    }
}
