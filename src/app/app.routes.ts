import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AlumnoLayout } from './features/alumno/alumno-layout/alumno-layout';
import { DocenteLayout } from './features/docente/docente-layout/docente-layout';
import { CoordinadorLayout } from './features/coordinador/coordinador-layout/coordinador-layout';
import { Inicio } from './features/alumno/inicio/inicio';
import { authGuard } from './core/guards/auth-guard';
import { Usuarios } from './features/coordinador/usuarios/usuarios';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'alumno',
    component: AlumnoLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio }
    ]
  },
  {
    path: 'docente',
    component: DocenteLayout,
    canActivate: [authGuard],
    children: []
  },
  {
    path: 'coordinador',
    component: CoordinadorLayout,
    canActivate: [authGuard],
    children: [
      { path: 'usuarios', component: Usuarios }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
```
eof