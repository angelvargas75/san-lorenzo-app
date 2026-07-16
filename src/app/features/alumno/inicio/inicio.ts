import { Component, inject, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { AlumnoApi, CourseSummary } from '../alumno-api.ts';

@Component({
  selector: 'app-inicio',
  imports: [PageTitle, StatCard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  private readonly api = inject(AlumnoApi);

  readonly promedio = signal(0);
  readonly asistencia = signal(0);
  readonly tareas = signal(0);
  readonly numeroCursos = signal(0);
  readonly cursos = signal<CourseSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.promedio.set(d.overallAverage);
        this.asistencia.set(d.attendancePercentage);
        this.numeroCursos.set(d.totalCourses);
        this.cursos.set(d.courses);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
