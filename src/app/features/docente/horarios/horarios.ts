import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { DocenteApi } from '../docente-api';

interface ClaseHorario {
  id: number;
  icon: string;
  nombre: string;
  horario: string;
  datetimeInicio: string;
  datetimeFin: string;
  dayOfWeek: number;
}

// Genera la grilla del calendario para cualquier mes/año
function generarCalendario(año: number, mes: number): (number | null)[][] {
  const primerDiaSemana = new Date(año, mes, 1).getDay();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const dias: (number | null)[] = [
    ...Array<null>(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];
  while (dias.length % 7 !== 0) dias.push(null);

  const semanas: (number | null)[][] = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));
  return semanas;
}

@Component({
  selector: 'app-horarios',
  imports: [PageTitle],
  templateUrl: './horarios.html',
  styleUrl: './horarios.scss',
})
export class Horarios implements OnInit {
  private readonly api = inject(DocenteApi);
  private readonly NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  private readonly NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  private readonly clasesList = signal<ClaseHorario[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.api.getSchedule().subscribe({
      next: (res) => {
        this.clasesList.set(res.classes.map(c => ({
          id: c.id,
          icon: c.icon || 'bi-book',
          nombre: c.name,
          horario: `${c.startTime} - ${c.endTime}`,
          datetimeInicio: c.startTime,
          datetimeFin: c.endTime,
          dayOfWeek: c.dayOfWeek
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  private readonly hoy = new Date();

  readonly mesActual = signal({
    mes: this.hoy.getMonth(),
    año: this.hoy.getFullYear(),
  });

  readonly diaSeleccionado = signal<number | null>(this.hoy.getDate());

  readonly semanas = computed(() => {
    const { mes, año } = this.mesActual();
    return generarCalendario(año, mes);
  });

  readonly tituloMes = computed(() => {
    const { mes, año } = this.mesActual();
    return `${this.NOMBRES_MES[mes]} ${año}`;
  });

  // Retorna el día de hoy solo si el mes visible es el mes actual
  readonly diaDeHoy = computed(() => {
    const { mes, año } = this.mesActual();
    return mes === this.hoy.getMonth() && año === this.hoy.getFullYear()
      ? this.hoy.getDate()
      : null;
  });

  readonly nombreDia = computed(() => {
    const dia = this.diaSeleccionado();
    if (dia === null) return null;
    const { mes, año } = this.mesActual();
    const fecha = new Date(año, mes, dia);
    return `${this.NOMBRES_DIA[fecha.getDay()]}, ${dia} de ${this.NOMBRES_MES[mes]}`;
  });

  readonly clases = computed((): ClaseHorario[] => {
    const dia = this.diaSeleccionado();
    if (dia === null) return [];
    const { mes, año } = this.mesActual();
    const diaSemana = new Date(año, mes, dia).getDay();
    return this.clasesList().filter(c => c.dayOfWeek === diaSemana);
  });

  seleccionarDia(dia: number): void {
    this.diaSeleccionado.set(dia);
  }

  anteriorMes(): void {
    this.diaSeleccionado.set(null);
    this.mesActual.update(({ mes, año }) =>
      mes === 0 ? { mes: 11, año: año - 1 } : { mes: mes - 1, año }
    );
  }

  siguienteMes(): void {
    this.diaSeleccionado.set(null);
    this.mesActual.update(({ mes, año }) =>
      mes === 11 ? { mes: 0, año: año + 1 } : { mes: mes + 1, año }
    );
  }
}
