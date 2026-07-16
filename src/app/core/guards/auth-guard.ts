import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.model';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data['role'] as
    | UserRole
    | undefined;

  if (requiredRole && !auth.hasRole(requiredRole)) {
    return router.createUrlTree([
      auth.getHomeRoute(),
    ]);
  }

  return true;
};
