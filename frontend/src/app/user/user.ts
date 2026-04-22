import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  // private api = 'http://localhost:3000/api/auth';
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getEmployees() {
    const token = localStorage.getItem('token'); //token para que solo admin tenga acceso

    return this.http.get(`${this.apiUrl}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
console.log('TOKEN:', localStorage.getItem('token'));
