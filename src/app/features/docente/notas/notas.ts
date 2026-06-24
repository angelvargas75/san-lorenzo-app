import { Component, computed, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';

interface RegistroNota {
  id: number;
  nombre: string;
  curso: string;
  grado: string;
  seccion: string;
  notas: readonly [number, number, number, number, number];
}

@Component({
  selector: 'app-notas',
  imports: [PageTitle],
  templateUrl: './notas.html',
  styleUrl: './notas.scss',
})
export class Notas {
  private readonly registrosMock: RegistroNota[] = [
    { id: 1, nombre: 'Carlos Mendoza',  curso: 'Álgebra', grado: '5to', seccion: 'A', notas: [15, 16, 14, 17, 17] },
    { id: 2, nombre: 'Sofia Ramirez',   curso: 'Álgebra', grado: '5to', seccion: 'A', notas: [18, 19, 17, 18, 18] },
    { id: 3, nombre: 'Diego Torres',    curso: 'Álgebra', grado: '5to', seccion: 'A', notas: [12, 13, 11, 14, 14] },
    { id: 4, nombre: 'Ana Rodriguez',   curso: 'Álgebra', grado: '5to', seccion: 'A', notas: [16, 17, 15, 16, 16] },
    { id: 5, nombre: 'Luis Castro',     curso: 'Álgebra', grado: '5to', seccion: 'A', notas: [14, 15, 13, 16, 16] },
    { id: 6, nombre: 'Maria Lopez',     curso: 'Álgebra', grado: '5to', seccion: 'A', notas: [17, 18, 16, 17, 17] },
  ];

  readonly cursos   = ['Álgebra', 'Matemáticas', 'Física', 'Historia'] as const;
  readonly grados   = ['5to', '4to', '3ro'] as const;
  readonly secciones = ['A', 'B', 'C'] as const;
  readonly periodos = ['1er Bimestre', '2do Bimestre', '3er Bimestre', '4to Bimestre'] as const;

  readonly filtroCurso   = signal('Álgebra');
  readonly filtroGrado   = signal('5to');
  readonly filtroSeccion = signal('A');
  readonly filtroPeriodo = signal('1er Bimestre');

  readonly registrosFiltrados = computed(() =>
    this.registrosMock.filter(r =>
      r.curso   === this.filtroCurso()   &&
      r.grado   === this.filtroGrado()   &&
      r.seccion === this.filtroSeccion()
    )
  );

  getPromedio(notas: readonly number[]): number {
    const sum = notas.reduce((acc, n) => acc + n, 0);
    return Math.round((sum / notas.length) * 10) / 10;
  }

  protected getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
