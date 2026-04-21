// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private userSub = new BehaviorSubject<User | null>(null);
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials);
  }

setToken(token: string) {
  localStorage.setItem('token', token);
  const payload = this.parseJwt(token);

  const rawRole = String(payload.role ?? 'employee');
  const role = rawRole.toLowerCase() === 'admin' ? 'admin' : 'employee';

  const user: User = {
    id: payload.sub ?? payload.id ?? '',
    email: payload.email ?? '',
    role: role as Role
  };

  localStorage.setItem('role', role);
  this.userSub.next(user);
}


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.userSub.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): Role | null {
    const r = this.userSub.value?.role ?? localStorage.getItem('role');
    if (!r) return null;
    const normalized = String(r).toLowerCase();
    return normalized === 'admin' ? 'admin' : 'employee';
  }


  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

private loadFromStorage() {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = this.parseJwt(token);
    const rawRole = String(payload.role ?? localStorage.getItem('role') ?? 'employee');
    const role = rawRole.toLowerCase() === 'admin' ? 'admin' : 'employee';

    const user: User = {
      id: payload.sub ?? payload.id ?? '',
      email: payload.email ?? '',
      role: role as Role
    };
    localStorage.setItem('role', role);
    this.userSub.next(user);
  }
}


  private parseJwt(token: string): any {
    try {
      const base64 = token.split('.')[1];
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
}
