import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class Calendar implements OnInit {

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: [],
    eventDisplay: 'block'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('https://planifyapp.onrender.com/api/dashboard').subscribe(turnos => {
      this.calendarOptions.events = turnos.map(t => ({
        title: `${t.empleado_nombre} (${t.start_time.slice(11,16)}-${t.end_time.slice(11,16)})`,
        start: t.start_time,
        end: t.end_time,
        color: this.getColorByEmpleado(t.empleado_nombre)
      }));
    });
  }

  getColorByEmpleado(nombre: string): string {
    const colores = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'];
    const index = Math.abs(nombre.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colores.length;
    return colores[index];
  }
}
