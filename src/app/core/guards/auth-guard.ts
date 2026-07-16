import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, Role } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (roles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const role = auth.role();
    return role && roles.includes(role) ? true : router.createUrlTree([auth.homePath()]);
  };
};
