// src/app/guards/admin.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const role = auth.getRole()?.trim().toUpperCase(); // debe devolver 'admin' | 'employee' | null
  if (role === 'ADMIN') return true;

  // Si no es admin, redirige al panel de empleado o a forbidden
  console.log('Acceso denegado: se requiere rol de admin');
  router.navigateByUrl('/employee/dashboard');
  return false;
};
