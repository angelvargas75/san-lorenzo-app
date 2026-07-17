import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { AlumnoApi, CourseGrade, StudentAssignment } from '../alumno-api';

@Component({
  selector: 'app-inicio',
  imports: [PageTitle, StatCard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  private readonly api = inject(AlumnoApi);

  readonly promedio = signal(0);
  readonly asistencia = signal(0);
  readonly numeroCursos = signal(0);
  readonly cursos = signal<CourseGrade[]>([]);
  readonly tareas = signal<StudentAssignment[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly pendientes = computed(() =>
    this.tareas().filter((t) => t.status === 'pendiente'),
  );

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

    this.api.getAssignments().subscribe({
      next: (list) => this.tareas.set(list),
    });
  }
}
