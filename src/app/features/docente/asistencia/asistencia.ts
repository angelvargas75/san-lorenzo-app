import { Component, computed, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';

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
export class Asistencia {
  readonly curso = 'Matemáticas';
  readonly fecha = '15 de mayo de 2024';

  readonly alumnos = signal<Alumno[]>([
    { id: 1, nombre: 'Sofia Mendoza', presente: true },
    { id: 2, nombre: 'Carlos Ruiz',   presente: true },
    { id: 3, nombre: 'Ana Torres',    presente: true },
    { id: 4, nombre: 'Diego López',   presente: true },
    { id: 5, nombre: 'Isabel García', presente: true },
  ]);

  readonly totalPresentes = computed(() => this.alumnos().filter(a => a.presente).length);
  readonly totalAusentes  = computed(() => this.alumnos().filter(a => !a.presente).length);

  readonly guardado = signal(false);

  toggleAsistencia(id: number): void {
    this.guardado.set(false);
    this.alumnos.update(list =>
      list.map(a => a.id === id ? { ...a, presente: !a.presente } : a)
    );
  }

  guardarAsistencia(): void {
    this.guardado.set(true);
  }
}
