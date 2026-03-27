import { CanActivateFn } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (token) {
    return true; // Permitir acceso si el token existe (deja pasar)
  } else {
    router.navigate(['/auth/login']);
    return false; // Denegar acceso si no hay token -> redirige al login
  }
};
