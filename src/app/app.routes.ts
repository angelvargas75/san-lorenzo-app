import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

import { Login } from './features/login/login/login';
import { AlumnoLayout } from './features/alumno/alumno-layout/alumno-layout';
import { DocenteLayout } from './features/docente/docente-layout/docente-layout';
import { CoordinadorLayout } from './features/coordinador/coordinador-layout/coordinador-layout';
import { Inicio } from './features/inicio/inicio/inicio';

import { InicioCoordinador } from './features/coordinador/inicio-coordinador/inicio-coordinador';
import { Usuarios } from './features/coordinador/usuarios/usuarios';
import { Academica } from './features/coordinador/academica/academica';
import { Horarios } from './features/coordinador/horarios/horarios';
import { Reportes } from './features/coordinador/reportes/reportes';
import { Comunicados } from './features/coordinador/comunicados/comunicados';
import { Configuracion } from './features/coordinador/configuracion/configuracion';
import { Perfil } from './features/coordinador/perfil/perfil';

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
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioCoordinador },
      { path: 'usuarios', component: Usuarios },
      { path: 'academica', component: Academica },
      { path: 'horarios', component: Horarios },
      { path: 'reportes', component: Reportes },
      { path: 'comunicados', component: Comunicados },
      { path: 'configuracion', component: Configuracion },
      { path: 'perfil', component: Perfil }
    ]
  },
  { path: '**', redirectTo: 'login' }
];