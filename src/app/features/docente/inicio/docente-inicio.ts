import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { DocenteApi } from '../docente-api';

interface CursoAsignado {
  id: number;
  nombre: string;
  grado: string;
  seccion: string;
  horario: string;
}

@Component({
  selector: 'app-docente-inicio',
  imports: [PageTitle, RouterLink, StatCard],
  templateUrl: './docente-inicio.html',
  styleUrl: './docente-inicio.scss',
})
export class DocenteInicio implements OnInit {
  private readonly api = inject(DocenteApi);

  readonly pendientes = signal(0);
  readonly totalAlumnos = signal(0);
  readonly cursos = signal<CursoAsignado[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.pendientes.set(d.pending);
        this.totalAlumnos.set(d.totalStudents);
        this.cursos.set(
          d.courses.map((c) => ({
            id: c.id,
            nombre: c.name,
            grado: c.gradeLevel,
            seccion: c.section,
            horario: c.schedule ?? '—',
          })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
