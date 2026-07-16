import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { DocenteApi } from '../docente-api';

interface Alumno {
  id: number;
  nombre: string;
  presente: boolean;
}

@Component({
  selector: 'app-asistencia',
  imports: [PageTitle],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.scss',
})
export class Asistencia implements OnInit {
  private readonly api = inject(DocenteApi);

  readonly curso = signal('');
  readonly fecha = signal('');
  readonly cursoId = signal<number>(1); // default courseId, should be dynamic in a real app or selected
  
  readonly alumnos = signal<Alumno[]>([]);

  readonly totalPresentes = computed(() => this.alumnos().filter(a => a.presente).length);
  readonly totalAusentes  = computed(() => this.alumnos().filter(a => !a.presente).length);

  readonly guardado = signal(false);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    // Ideally we would select the course first, but for now we hardcode courseId = 1 or fetch from the first course
    this.api.getCourses().subscribe({
      next: (courses) => {
        if (courses.length > 0) {
          const firstCourse = courses[0];
          this.cursoId.set(firstCourse.id);
          this.curso.set(firstCourse.name);
          this.loadAttendance(firstCourse.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  loadAttendance(courseId: number): void {
    this.loading.set(true);
    this.api.getAttendance(courseId).subscribe({
      next: (res) => {
        this.curso.set(res.course);
        this.fecha.set(res.date);
        this.alumnos.set(res.students.map(s => ({
          id: s.studentId,
          nombre: s.name,
          presente: s.present
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  toggleAsistencia(id: number): void {
    this.guardado.set(false);
    this.alumnos.update(list =>
      list.map(a => a.id === id ? { ...a, presente: !a.presente } : a)
    );
  }

  guardarAsistencia(): void {
    this.guardado.set(false);
    this.loading.set(true);
    this.api.saveAttendance({
      courseId: this.cursoId(),
      date: this.fecha(),
      entries: this.alumnos().map(a => ({ studentId: a.id, present: a.presente }))
    }).subscribe({
      next: () => {
        this.guardado.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}
