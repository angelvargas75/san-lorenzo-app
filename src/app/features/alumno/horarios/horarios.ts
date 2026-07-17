import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { AlumnoApi, ScheduledClass } from '../alumno-api';

interface Dia {
  value: number; // 0 = domingo … 6 = sábado
  label: string;
}

@Component({
  selector: 'app-horarios',
  imports: [PageTitle],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class Horarios implements OnInit {
  private readonly api = inject(AlumnoApi);

  readonly dias: Dia[] = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
  ];

  readonly clases = signal<ScheduledClass[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  private readonly hoy = new Date().getDay();
  readonly diaActivo = signal(this.hoy >= 1 && this.hoy <= 5 ? this.hoy : 1);

  readonly clasesDelDia = computed(() =>
    this.clases().filter((c) => c.dayOfWeek === this.diaActivo()),
  );

  ngOnInit(): void {
    this.api.getSchedule().subscribe({
      next: (r) => {
        this.clases.set(r.classes);
        // Si el día actual no tiene clases, abre en el primer día de la semana que sí.
        if (!r.classes.some((c) => c.dayOfWeek === this.diaActivo())) {
          const primero = this.dias.find((d) =>
            r.classes.some((c) => c.dayOfWeek === d.value),
          );
          if (primero) this.diaActivo.set(primero.value);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  seleccionarDia(value: number): void {
    this.diaActivo.set(value);
  }
}
