import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { AlumnoLayout } from './features/alumno/alumno-layout/alumno-layout';
import { DocenteLayout } from './features/docente/docente-layout/docente-layout';
import { CoordinadorLayout } from './features/coordinador/coordinador-layout/coordinador-layout';
import { Inicio } from './features/alumno/inicio/inicio';
import { Calificaciones } from './features/alumno/calificaciones/calificaciones';
import { Tareas } from './features/alumno/tareas/tareas';
import { Horarios } from './features/alumno/horarios/horarios';
import { Asistencia } from './features/alumno/asistencia/asistencia';
import { Perfil } from './features/alumno/perfil/perfil';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'alumno',
    component: AlumnoLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'calificaciones', component: Calificaciones },
      { path: 'tareas', component: Tareas },
      { path: 'horarios', component: Horarios },
      { path: 'asistencia', component: Asistencia },
      { path: 'perfil', component: Perfil },
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
    children: []
  },
  { path: '**', redirectTo: 'login' }
];
