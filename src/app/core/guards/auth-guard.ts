import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, Role } from '../services/auth';

/** Exige sesión activa. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/** Exige sesión activa Y uno de los roles indicados; si no, manda a la home del rol. */
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
