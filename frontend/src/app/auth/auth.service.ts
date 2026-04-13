import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
      return this.http.post<{ token: string; role: 'admin' | 'employee' }>(`${this.apiUrl}/login`, credentials) ;
    }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): 'admin' | 'employee' | null {
    return localStorage.getItem('role') as any;
  }
  
  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}
