import { Component, computed, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';

interface ClaseHorario {
  icon: string;
  nombre: string;
  horario: string;
  datetimeInicio: string;
  datetimeFin: string;
}

@Component({
  selector: 'app-horarios',
  imports: [PageTitle],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class Horarios {
  private readonly NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Abril 2024: día 1 = lunes → índice de día = d % 7 (0=Dom, 1=Lun, …, 6=Sab)
  readonly calendarWeeks: (number | null)[][] = [
    [null, 1,  2,  3,  4,  5,  6 ],
    [7,    8,  9,  10, 11, 12, 13],
    [14,   15, 16, 17, 18, 19, 20],
    [21,   22, 23, 24, 25, 26, 27],
    [28,   29, 30, null, null, null, null],
  ];

  private readonly clasesMock: ClaseHorario[] = [
    { icon: 'bi-book',     nombre: 'Matemáticas', horario: '8:00 AM - 9:00 AM',   datetimeInicio: '08:00', datetimeFin: '09:00' },
    { icon: 'bi-eyedropper', nombre: 'Ciencias',  horario: '9:00 AM - 10:00 AM',  datetimeInicio: '09:00', datetimeFin: '10:00' },
    { icon: 'bi-map',      nombre: 'Historia',    horario: '10:00 AM - 11:00 AM', datetimeInicio: '10:00', datetimeFin: '11:00' },
    { icon: 'bi-cup-hot',  nombre: 'Almuerzo',    horario: '11:00 AM - 12:00 PM', datetimeInicio: '11:00', datetimeFin: '12:00' },
    { icon: 'bi-globe',    nombre: 'Inglés',      horario: '12:00 PM - 1:00 PM',  datetimeInicio: '12:00', datetimeFin: '13:00' },
  ];

  readonly diaSeleccionado = signal(25);

  readonly nombreDia = computed(() => {
    const d = this.diaSeleccionado();
    const idx = d % 7;
    return `${this.NOMBRES_DIA[idx]}, ${d} de Abril`;
  });

  readonly clases = computed((): ClaseHorario[] => {
    const d = this.diaSeleccionado();
    return (d % 7 === 0 || d % 7 === 6) ? [] : this.clasesMock;
  });

  seleccionarDia(dia: number): void {
    this.diaSeleccionado.set(dia);
  }
}
