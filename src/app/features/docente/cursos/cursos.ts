import { Component, computed, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';

interface Curso {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  color: string;
}

@Component({
  selector: 'app-cursos',
  imports: [PageTitle],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss',
})
export class Cursos {
  private readonly cursosMock: Curso[] = [
    { id: 1, nombre: 'Matemáticas Avanzadas', grado: '11', seccion: 'A', color: '#FDE68A' },
    { id: 2, nombre: 'Física Fundamental',    grado: '10', seccion: 'B', color: '#1a5c6d' },
    { id: 3, nombre: 'Química Orgánica',      grado: '12', seccion: 'A', color: '#F3F4F6' },
    { id: 4, nombre: 'Biología Celular',      grado: '11', seccion: 'B', color: '#A7F3D0' },
  ];

  readonly filtroSeccion = signal('');
  readonly filtroGrado = signal('');
  readonly filtroCurso = signal('');

  readonly secciones = computed(() =>
    [...new Set(this.cursosMock.map(c => c.seccion))].sort()
  );
  readonly grados = computed(() =>
    [...new Set(this.cursosMock.map(c => c.grado))].sort()
  );
  readonly nombresCursos = computed(() =>
    [...new Set(this.cursosMock.map(c => c.nombre))].sort()
  );

  readonly cursosFiltrados = computed(() => {
    const seccion = this.filtroSeccion();
    const grado = this.filtroGrado();
    const nombre = this.filtroCurso();
    return this.cursosMock.filter(c =>
      (!seccion || c.seccion === seccion) &&
      (!grado   || c.grado   === grado)  &&
      (!nombre  || c.nombre  === nombre)
    );
  });

  protected getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
