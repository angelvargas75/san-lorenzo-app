import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoordinadorApi } from '../coordinador-api';

@Component({
  selector: 'app-inicio-coordinador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-coordinador.html',
  styleUrl: './inicio-coordinador.scss'
})
export class InicioCoordinador implements OnInit {
  private readonly api = inject(CoordinadorApi);

  readonly totalAlumnos = signal(0);
  readonly docentesActivos = signal(0);
  readonly asistenciaHoy = signal(0);
  readonly cumplimientoNotas = signal(0);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => {
        this.totalAlumnos.set(d.totalStudents);
        this.docentesActivos.set(d.activeTeachers);
        this.asistenciaHoy.set(d.attendanceTodayPercentage);
        this.cumplimientoNotas.set(d.gradesCompliancePercentage);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}