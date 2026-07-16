import { Component, computed, inject, OnInit, effect, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { DocenteApi } from '../docente-api';

interface RegistroNota {
  id: number;
  nombre: string;
  curso: string;
  grado: string;
  seccion: string;
  notas: [number, number, number, number, number];
}

@Component({
  selector: 'app-notas',
  imports: [PageTitle],
  templateUrl: './notas.html',
  styleUrl: './notas.scss',
})
export class Notas implements OnInit {
  private readonly api = inject(DocenteApi);

  readonly cursos   = ['Álgebra', 'Matemáticas', 'Física', 'Historia'] as const;
  readonly grados   = ['5to', '4to', '3ro'] as const;
  readonly secciones = ['A', 'B', 'C'] as const;
  readonly periodos = ['1er Bimestre', '2do Bimestre', '3er Bimestre', '4to Bimestre'] as const;

  readonly filtroCurso   = signal('Álgebra');
  readonly filtroGrado   = signal('5to');
  readonly filtroSeccion = signal('A');
  readonly filtroPeriodo = signal('1er Bimestre');

  readonly registrosFiltrados = signal<RegistroNota[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  constructor() {
    effect(() => {
      const course = this.filtroCurso();
      const gradeLevel = this.filtroGrado();
      const section = this.filtroSeccion();
      const term = this.filtroPeriodo();

      if (course && gradeLevel && section && term) {
        this.loading.set(true);
        this.api.getGrades({ course, gradeLevel, section, term }).subscribe({
          next: (res) => {
            this.registrosFiltrados.set(res.entries.map(e => ({
              id: e.studentId,
              nombre: e.name,
              curso: res.course,
              grado: res.gradeLevel,
              seccion: res.section,
              notas: [e.score1, e.score2, e.score3, e.score4, e.score5]
            })));
            this.loading.set(false);
          },
          error: () => {
            this.error.set(true);
            this.registrosFiltrados.set([]);
            this.loading.set(false);
          }
        });
      }
    });
  }

  ngOnInit(): void {}

  getPromedio(notas: readonly number[]): number {
    const sum = notas.reduce((acc, n) => acc + n, 0);
    return Math.round((sum / notas.length) * 10) / 10;
  }

  protected getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
