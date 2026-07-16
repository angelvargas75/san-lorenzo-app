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
import { Perfil as PerfilAlumno } from './features/alumno/perfil/perfil';
import { authGuard } from './core/guards/auth-guard';
import { Reportes } from './features/coordinador/reportes/reportes';
import { Comunicados } from './features/coordinador/comunicados/comunicados';
import { Configuracion } from './features/coordinador/configuracion/configuracion';
import { Perfil as PerfilCoordinador } from './features/coordinador/perfil/perfil';

import { InicioCoordinador } from './features/coordinador/inicio-coordinador/inicio-coordinador';
import { Usuarios } from './features/coordinador/usuarios/usuarios';
import { Academica } from './features/coordinador/academica/academica';
import { Horarios as HorariosCoordinador } from './features/coordinador/horarios/horarios';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  // Ruta del alumno
  {
    path: 'alumno',
    component: AlumnoLayout,
    canActivate: [authGuard],
    data: { role: 'Student' },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'calificaciones', component: Calificaciones },
      { path: 'tareas', component: Tareas },
      { path: 'horarios', component: Horarios },
      { path: 'asistencia', component: Asistencia },
      { path: 'perfil', component: PerfilAlumno },
    ]
  },

  // Ruta del docente (usa lazy loading)
  {
    path: 'docente',
    component: DocenteLayout,
    canActivate: [authGuard],
    data: { role: 'Teacher' },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/docente/inicio/docente-inicio').then(m => m.DocenteInicio),
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/docente/cursos/cursos').then(m => m.Cursos),
      },
      {
        path: 'notas',
        loadComponent: () => import('./features/docente/notas/notas').then(m => m.Notas),
      },
      {
        path: 'asistencia',
        loadComponent: () => import('./features/docente/asistencia/asistencia').then(m => m.Asistencia),
      },
      {
        path: 'horarios',
        loadComponent: () => import('./features/docente/horarios/horarios').then(m => m.Horarios),
      },
      {
        path: 'comunicaciones',
        loadComponent: () => import('./features/docente/comunicaciones/comunicaciones').then(m => m.Comunicaciones),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/docente/perfil/perfil').then(m => m.Perfil),
      },
    ]
  },

  // Ruta del coordinador
  {
    path: 'coordinador',
    component: CoordinadorLayout,
    canActivate: [authGuard],
    data: { role: 'Coordinator' },
    children: [
       { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioCoordinador },
      { path: 'usuarios', component: Usuarios },
      { path: 'academica', component: Academica },
      { path: 'horarios', component: HorariosCoordinador },
      { path: 'reportes', component: Reportes },
      { path: 'comunicados', component: Comunicados },
      { path: 'configuracion', component: Configuracion },
      { path: 'perfil', component: PerfilCoordinador },
    ]
  },

  { path: '**', redirectTo: 'login' }
];