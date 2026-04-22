import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FichajesService {

  // private api = 'http://localhost:3000/api/fichajes';
  private apiUrl = `${environment.apiUrl}/fichajes`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  getStatus() {
    return this.http.get(`${this.apiUrl}/status`, this.getHeaders());
  }

  getTurnoActual() {
  const token = localStorage.getItem('token');
  return this.http.get(`${this.apiUrl}/turno-actual`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  }

  clockIn(schedule_id: number) {
     const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/clock-in`, { schedule_id }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  clockOut() {
    return this.http.post(`${this.apiUrl}/clock-out`, {}, this.getHeaders());
  }

  getMisTurnos() {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/mis-turnos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

}
