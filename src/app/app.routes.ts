import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AlumnoLayout } from './features/alumno/alumno-layout/alumno-layout';
import { DocenteLayout } from './features/docente/docente-layout/docente-layout';
import { CoordinadorLayout } from './features/coordinador/coordinador-layout/coordinador-layout';
import { Inicio } from './features/alumno/inicio/inicio';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Al entrar, redirige al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta del login
  { path: 'login', component: Login },

  // Ruta del alumno (el layout es el padre, los hijos los agregará Dev 2)
  {
    path: 'alumno',
    component: AlumnoLayout,
    canActivate: [authGuard],
    children: [
         { path: '', redirectTo: 'inicio', pathMatch: 'full' },
        { path: 'inicio', component: Inicio },
      // Dev 2 agregará aquí: inicio, calificaciones, tareas, etc.
    ]
  },

  // Ruta del docente (Dev 3 agregará los hijos)
  {
    path: 'docente',
    component: DocenteLayout,
    canActivate: [authGuard],
    children: [
      // Dev 3 agregará aquí sus secciones
    ]
  },

  // Ruta del coordinador (Dev 4 y 5 agregarán los hijos)
  {
    path: 'coordinador',
    component: CoordinadorLayout,
    canActivate: [authGuard],
    children: [
      // Dev 4 y 5 agregarán aquí sus secciones
    ]
  },

  // Si la ruta no existe, redirige al login
  { path: '**', redirectTo: 'login' }
];