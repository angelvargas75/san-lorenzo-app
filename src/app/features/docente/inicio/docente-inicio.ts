import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

interface CursoAsignado {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  horario: string;
}

@Component({
  selector: 'app-docente-inicio',
  imports: [PageTitle, RouterLink, StatCard],
  templateUrl: './docente-inicio.html',
  styleUrl: './docente-inicio.scss',
})
export class DocenteInicio {
  readonly pendientes = 3;
  readonly totalAlumnos = 120;

  readonly cursos: CursoAsignado[] = [
    { id: 1, nombre: 'Matemáticas',        grado: '5to', seccion: 'A', horario: 'Lunes y Miércoles 8:00 AM - 9:30 AM' },
    { id: 2, nombre: 'Ciencias Naturales', grado: '4to', seccion: 'B', horario: 'Martes y Jueves 10:00 AM - 11:30 AM' },
    { id: 3, nombre: 'Ciencias Naturales', grado: '4to', seccion: 'C', horario: 'Martes y Jueves 10:00 AM - 11:30 AM' },
    { id: 4, nombre: 'Historia',            grado: '3ro', seccion: 'C', horario: 'Viernes 1:00 PM - 2:30 PM' },
  ];
}
