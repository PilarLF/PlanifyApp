import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Horarios {
  // private api = 'http://localhost:3000/api/horarios';
  private apiUrl = `${environment.apiUrl}/horarios`;

  constructor(private http: HttpClient) {}

  getHorarios() {
    return this.http.get(`${this.apiUrl}`);
  }
  getHorariosEmpleado(id:number) {
    return this.http.get(`${this.apiUrl}/empleado/${id}`);
  }

  createHorario(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  updateHorario(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteHorario(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  } 
}
