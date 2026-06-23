import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Si hay sesión activa, deja pasar
  if (auth.isLoggedIn()) {
    return true;
  }

  // Si NO hay sesión, redirige al login y bloquea el acceso
  router.navigate(['/login']);
  return false;
};