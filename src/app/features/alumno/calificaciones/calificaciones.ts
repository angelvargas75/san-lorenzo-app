import { Component, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { AlumnoApi, CourseGrade } from '../alumno-api';

@Component({
  selector: 'app-calificaciones',
  imports: [PageTitle],
  templateUrl: './calificaciones.html',
  styleUrl: './calificaciones.scss',
})
export class Calificaciones implements OnInit {
  private readonly api = inject(AlumnoApi);

  readonly cursos = signal<CourseGrade[]>([]);
  readonly term = signal('');
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getGrades().subscribe({
      next: (r) => {
        this.cursos.set(r.courses);
        this.term.set(r.term);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
