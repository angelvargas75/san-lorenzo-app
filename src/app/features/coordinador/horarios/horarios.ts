import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  CoordinadorApi,
  AdminScheduleSlot,
  AdminCourse,
  SaveScheduleSlotRequest,
} from '../coordinador-api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
// Asunción: 1=Lunes ... 5=Viernes (convención estándar .NET DayOfWeek). CONFIRMAR con Sebastián.
const DIA_A_INDICE: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss'
})
export class Horarios implements OnInit {
  private readonly api = inject(CoordinadorApi);

  readonly dias = DIAS;
  readonly horarios = signal<AdminScheduleSlot[]>([]);
  readonly cursos = signal<AdminCourse[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly busqueda = signal('');

  readonly mostrarForm = signal(false);
  formHorario: SaveScheduleSlotRequest = {
    courseId: 0, startTime: '', endTime: '', dayOfWeek: 1, icon: 'book',
  };

  /** Horas únicas presentes en los datos, ordenadas, para armar las filas del grid. */
  readonly horasUnicas = computed(() => {
    const set = new Set(this.horarios().map(h => h.startTime));
    return Array.from(set).sort();
  });

  /** Horarios filtrados por el texto de búsqueda (nombre de curso). */
  readonly horariosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.horarios();
    return this.horarios().filter(h => h.courseName.toLowerCase().includes(termino));
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      horarios: this.api.getHorarios(),
      cursos: this.api.getCursos(),
    }).subscribe({
      next: ({ horarios, cursos }) => {
        this.horarios.set(horarios);
        this.cursos.set(cursos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /** Busca el slot que corresponde a una hora + día específico, si existe. */
  obtenerSlot(hora: string, indiceDia: number): AdminScheduleSlot | undefined {
    return this.horariosFiltrados().find(h =>
      h.startTime === hora && DIA_A_INDICE[h.dayOfWeek] === indiceDia
    );
  }

  formatearHora(hora24: string): string {
    const [h, m] = hora24.split(':').map(Number);
    const periodo = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${periodo}`;
  }

  abrirFormNuevo(): void {
    this.formHorario = { courseId: 0, startTime: '', endTime: '', dayOfWeek: 1, icon: 'book' };
    this.mostrarForm.set(true);
  }

  cancelarForm(): void {
    this.mostrarForm.set(false);
  }

  guardarHorario(): void {
    this.api.crearHorario(this.formHorario).subscribe({
      next: () => {
        this.mostrarForm.set(false);
        this.cargarDatos();
      },
      error: () => alert('No se pudo crear el horario. Verifica que no se cruce con otro existente.'),
    });
  }

  eliminarHorario(id: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('¿Eliminar este horario?')) return;
    this.api.eliminarHorario(id).subscribe({
      next: () => this.cargarDatos(),
      error: () => alert('No se pudo eliminar el horario.'),
    });
  }
}