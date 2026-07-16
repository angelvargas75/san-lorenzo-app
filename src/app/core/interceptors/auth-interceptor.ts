import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

/** Adjunta el JWT a cada request si hay sesión. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Auth).token();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
