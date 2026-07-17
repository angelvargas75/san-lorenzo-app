import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { AlumnoApi, StudentAssignment } from '../alumno-api';

@Component({
  selector: 'app-tareas',
  imports: [PageTitle],
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
})
export class Tareas implements OnInit {
  private readonly api = inject(AlumnoApi);

  readonly items = signal<StudentAssignment[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  // "tareas" → Task, "examenes" → Exam
  readonly tabActivo = signal<'tareas' | 'examenes'>('tareas');
  readonly filtro = signal<'todas' | 'pendiente' | 'vencida'>('todas');

  readonly visibles = computed(() => {
    const tipo = this.tabActivo() === 'tareas' ? 'Task' : 'Exam';
    const estado = this.filtro();
    return this.items().filter(
      (a) => a.type === tipo && (estado === 'todas' || a.status === estado),
    );
  });

  ngOnInit(): void {
    this.api.getAssignments().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
