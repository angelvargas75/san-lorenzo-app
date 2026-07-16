import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { DocenteApi } from '../docente-api';

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
export class Cursos implements OnInit {
  private readonly api = inject(DocenteApi);

  readonly cursosList = signal<Curso[]>([]);
  readonly filtroSeccion = signal('');
  readonly filtroGrado = signal('');
  readonly filtroCurso = signal('');

  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getCourses().subscribe({
      next: (data) => {
        this.cursosList.set(data.map(c => ({
          id: c.id,
          nombre: c.name,
          grado: c.gradeLevel,
          seccion: c.section,
          color: c.color || '#F3F4F6'
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  readonly secciones = computed(() =>
    [...new Set(this.cursosList().map(c => c.seccion))].sort()
  );
  readonly grados = computed(() =>
    [...new Set(this.cursosList().map(c => c.grado))].sort()
  );
  readonly nombresCursos = computed(() =>
    [...new Set(this.cursosList().map(c => c.nombre))].sort()
  );

  readonly cursosFiltrados = computed(() => {
    const seccion = this.filtroSeccion();
    const grado = this.filtroGrado();
    const nombre = this.filtroCurso();
    return this.cursosList().filter(c =>
      (!seccion || c.seccion === seccion) &&
      (!grado   || c.grado   === grado)  &&
      (!nombre  || c.nombre  === nombre)
    );
  });

  protected getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
