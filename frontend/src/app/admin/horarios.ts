import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/enivonment';

@Injectable({
  providedIn: 'root',
})
export class Horarios {
  // private api = 'http://localhost:3000/api/horarios';
  private api = `${environment.apiUrl}/api/horarios`;

  constructor(private http: HttpClient) {}

  getHorarios() {
    return this.http.get(`${this.api}`);
  }
  getHorariosEmpleado(id:number) {
    return this.http.get(`${this.api}/empleado/${id}`);
  }

  createHorario(data: any) {
    return this.http.post(`${this.api}`, data);
  }

  updateHorario(id: string, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  deleteHorario(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  } 
}
