import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import {
  CoordinadorApi,
  ReportListItem,
  TeacherOption,
  GradeSection,
} from '../coordinador-api';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitle],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private readonly api = inject(CoordinadorApi);

  readonly reportes = signal<ReportListItem[]>([]);
  readonly docentes = signal<TeacherOption[]>([]);
  readonly grados = signal<string[]>([]);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly generando = signal(false);
  readonly descargandoId = signal<number | null>(null);

  gradoSeleccionado = '';
  docenteSeleccionadoId: number | null = null;
  periodoSeleccionado = '';

  readonly periodos = ['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4'];

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      reportes: this.api.getReportes(),
      docentes: this.api.getDocentesOptions(),
      grados: this.api.getGradosSecciones(),
    }).subscribe({
      next: ({ reportes, docentes, grados }) => {
        this.reportes.set(reportes);
        this.docentes.set(docentes);
        // Grados únicos (puede haber varias secciones por grado)
        const gradosUnicos = Array.from(new Set(grados.map((g: GradeSection) => g.gradeLevel)));
        this.grados.set(gradosUnicos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  generarReporte(): void {
    if (!this.gradoSeleccionado || !this.periodoSeleccionado) {
      alert('Selecciona al menos Grado y Periodo.');
      return;
    }

    this.generando.set(true);
    this.api.generarReporte({
      gradeLevel: this.gradoSeleccionado,
      term: this.periodoSeleccionado,
      teacherId: this.docenteSeleccionadoId,
    }).subscribe({
      next: () => {
        this.generando.set(false);
        this.cargarDatos();
      },
      error: () => {
        this.generando.set(false);
        alert('No se pudo generar el reporte.');
      },
    });
  }

  descargarReporte(id: number): void {
    this.descargandoId.set(id);
    this.api.descargarReporte(id).subscribe({
      next: (response) => {
        const blob = response.body!;
        const contentType = response.headers.get('Content-Type') ?? 'application/octet-stream';

        // Intenta obtener el nombre real desde Content-Disposition; si no viene, arma uno genérico.
        const disposition = response.headers.get('Content-Disposition');
        let nombreArchivo = `reporte-${id}`;
        const match = disposition?.match(/filename="?([^"]+)"?/);
        if (match) {
          nombreArchivo = match[1];
        } else {
          const extension = contentType.includes('pdf') ? 'pdf'
            : contentType.includes('spreadsheet') || contentType.includes('excel') ? 'xlsx'
            : contentType.includes('csv') ? 'csv'
            : 'bin';
          nombreArchivo = `reporte-${id}.${extension}`;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);
        this.descargandoId.set(null);
      },
      error: () => {
        this.descargandoId.set(null);
        alert('No se pudo descargar el reporte.');
      },
    });
  }
}