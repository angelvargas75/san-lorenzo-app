import { Component, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { AlumnoApi, AttendanceItem } from '../alumno-api';

@Component({
  selector: 'app-asistencia',
  imports: [PageTitle],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.scss',
})
export class Asistencia implements OnInit {
  private readonly api = inject(AlumnoApi);

  readonly totalInasistencias = signal(0);
  readonly historial = signal<AttendanceItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getAttendance().subscribe({
      next: (r) => {
        this.totalInasistencias.set(r.totalAbsences);
        this.historial.set(r.history);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
