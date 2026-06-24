import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { PageTitle } from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-horarios',
  imports: [PageTitle, NgClass],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class Horarios {
  // Día actualmente seleccionado en el calendario
  diaActivo: number = 15;

  // Texto que se muestra arriba según el día
  diaSeleccionado: string = 'Lunes, 15 de Abril';

  // Lista de clases del día
  clases = [
    { nombre: 'Matemáticas',      horario: '8:00 AM - 9:00 AM',   icono: 'bi-book' },
    { nombre: 'Ciencias',         horario: '9:00 AM - 10:00 AM',  icono: 'bi-eyedropper' },
    { nombre: 'Historia',         horario: '10:00 AM - 11:00 AM', icono: 'bi-map' },
    { nombre: 'Almuerzo',         horario: '11:00 AM - 12:00 PM', icono: 'bi-cup-hot' },
    { nombre: 'Inglés',           horario: '12:00 PM - 1:00 PM',  icono: 'bi-globe' },
    { nombre: 'Educación Física', horario: '1:00 PM - 2:00 PM',   icono: 'bi-person-walking' },
  ];

  // Estructura del calendario (0 = celda vacía)
  semanas: number[][] = [
    [0, 1, 2, 3, 4, 5, 6],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 0, 0, 0, 0, 0],
  ];

  // Al hacer clic en un día, lo marca como activo
  seleccionarDia(dia: number): void {
    this.diaActivo = dia;
    this.diaSeleccionado = 'Día ' + dia + ' de Abril';
  }
}
