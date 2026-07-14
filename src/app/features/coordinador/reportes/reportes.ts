import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PageTitle } from '../../../shared/components/page-title/page-title';
import {
  FiltroReporte,
  ReporteDetalle,
  TipoReporte
} from '../models/reporte.model';

interface DocenteOpcion {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-reportes',
  imports: [
    PageTitle,
    ReactiveFormsModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storageKey = 'reportes-coordinador';

  readonly tiposReporte: {
    value: TipoReporte;
    label: string;
  }[] = [
    {
      value: 'ASISTENCIA',
      label: 'Asistencia'
    },
    {
      value: 'CALIFICACIONES',
      label: 'Calificaciones'
    },
    {
      value: 'USUARIOS',
      label: 'Usuarios'
    }
  ];

  readonly grados = [
    'Primero de primaria',
    'Segundo de primaria',
    'Tercero de primaria',
    'Cuarto de primaria',
    'Quinto de primaria',
    'Sexto de primaria',
    'Primero de secundaria',
    'Segundo de secundaria',
    'Tercero de secundaria',
    'Cuarto de secundaria',
    'Quinto de secundaria'
  ];

  readonly secciones = [
    'A',
    'B',
    'C'
  ];

  readonly periodos = [
    'Bimestre 1',
    'Bimestre 2',
    'Bimestre 3',
    'Bimestre 4',
    'Año académico 2026'
  ];

  readonly docentes: DocenteOpcion[] = [
    {
      id: 1,
      nombre: 'Prof. Ana Torres'
    },
    {
      id: 2,
      nombre: 'Prof. Carlos Ruiz'
    },
    {
      id: 3,
      nombre: 'Prof. Laura Gómez'
    },
    {
      id: 4,
      nombre: 'Prof. Miguel Sánchez'
    }
  ];

  reportes: ReporteDetalle[] = [];
  reporteSeleccionado: ReporteDetalle | null = null;

  mensajeExito = '';
  mensajeError = '';

  readonly reporteForm = this.formBuilder.nonNullable.group({
    tipoReporte: [
      '' as TipoReporte | '',
      Validators.required
    ],

    grado: [''],
    seccion: [''],
    docenteId: [''],

    periodo: [
      '',
      Validators.required
    ]
  });

  readonly historialForm = this.formBuilder.nonNullable.group({
    tipoReporte: ['' as TipoReporte | ''],
    periodo: ['']
  });

  ngOnInit(): void {
    this.cargarReportesTemporales();
  }

  get controles() {
    return this.reporteForm.controls;
  }

  get reportesFiltrados(): ReporteDetalle[] {
    const filtros = this.historialForm.getRawValue();

    return [...this.reportes]
      .filter((reporte) => {
        const coincideTipo =
          !filtros.tipoReporte ||
          reporte.tipoReporte === filtros.tipoReporte;

        const coincidePeriodo =
          !filtros.periodo ||
          this.obtenerPeriodo(reporte) === filtros.periodo;

        return coincideTipo && coincidePeriodo;
      })
      .sort((a, b) => {
        return (
          new Date(b.fechaGeneracion).getTime() -
          new Date(a.fechaGeneracion).getTime()
        );
      });
  }

  generarReporte(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();

      this.mensajeError =
        'Selecciona el tipo de reporte y el periodo.';

      return;
    }

    const datos = this.reporteForm.getRawValue();

    const docenteId =
      datos.docenteId === ''
        ? null
        : Number(datos.docenteId);

    const filtros: FiltroReporte = {
      tipoReporte: datos.tipoReporte as TipoReporte,
      grado: datos.grado || null,
      seccion: datos.seccion || null,
      docenteId,
      periodo: datos.periodo,
      generadoPorUsuarioId: 1
    };

    const nuevoReporte: ReporteDetalle = {
      reporteId: this.generarId(),
      tipoReporte: filtros.tipoReporte,
      generadoPorUsuarioId:
        filtros.generadoPorUsuarioId,
      fechaGeneracion: new Date().toISOString(),

      filtros: {
        tipoReporte: filtros.tipoReporte,
        grado: filtros.grado,
        seccion: filtros.seccion,
        docenteId: filtros.docenteId,
        periodo: filtros.periodo,
        generadoPorUsuarioId:
          filtros.generadoPorUsuarioId
      },

      resultado: this.generarResultadoSimulado(
        filtros
      )
    };

    this.reportes.push(nuevoReporte);
    this.reporteSeleccionado = nuevoReporte;

    this.guardarEnLocalStorage();

    this.mensajeExito =
      'El reporte se generó correctamente.';
  }

  seleccionarReporte(
    reporte: ReporteDetalle
  ): void {
    this.reporteSeleccionado = reporte;
    this.mensajeExito = '';
    this.mensajeError = '';

    setTimeout(() => {
      document
        .getElementById('detalle-reporte')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    });
  }

  descargarReporte(
    reporte: ReporteDetalle
  ): void {
    if (reporte.resultado.length === 0) {
      this.mensajeError =
        'El reporte no contiene información para descargar.';

      return;
    }

    const columnas = Object.keys(
      reporte.resultado[0]
    );

    const encabezado = columnas
      .map((columna) =>
        this.escaparCsv(
          this.formatearClave(columna)
        )
      )
      .join(',');

    const filas = reporte.resultado.map(
      (registro) =>
        columnas
          .map((columna) =>
            this.escaparCsv(
              this.formatearValor(
                registro[columna]
              )
            )
          )
          .join(',')
    );

    const contenidoCsv = [
      encabezado,
      ...filas
    ].join('\r\n');

    const blob = new Blob(
      [
        '\uFEFF',
        contenidoCsv
      ],
      {
        type: 'text/csv;charset=utf-8'
      }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download =
      `reporte-${reporte.tipoReporte.toLowerCase()}-${reporte.reporteId}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);

    this.mensajeExito =
      'El reporte fue descargado en formato CSV.';
  }

  eliminarReporte(
    reporte: ReporteDetalle
  ): void {
    this.reportes = this.reportes.filter(
      (elemento) =>
        elemento.reporteId !== reporte.reporteId
    );

    if (
      this.reporteSeleccionado?.reporteId ===
      reporte.reporteId
    ) {
      this.reporteSeleccionado = null;
    }

    this.guardarEnLocalStorage();

    this.mensajeExito =
      'El reporte fue eliminado del historial.';
  }

  limpiarFormulario(): void {
    this.reporteForm.reset({
      tipoReporte: '',
      grado: '',
      seccion: '',
      docenteId: '',
      periodo: ''
    });

    this.mensajeError = '';
  }

  limpiarFiltros(): void {
    this.historialForm.reset({
      tipoReporte: '',
      periodo: ''
    });
  }

  etiquetaTipo(
    tipoReporte: TipoReporte
  ): string {
    return this.tiposReporte.find(
      (tipo) => tipo.value === tipoReporte
    )?.label ?? tipoReporte;
  }

  obtenerPeriodo(
    reporte: ReporteDetalle
  ): string {
    const periodo =
      reporte.filtros['periodo'];

    return typeof periodo === 'string'
      ? periodo
      : 'Sin periodo';
  }

  obtenerGrado(
    reporte: ReporteDetalle
  ): string {
    const grado =
      reporte.filtros['grado'];

    return typeof grado === 'string' &&
      grado.trim().length > 0
      ? grado
      : 'Todos';
  }

  obtenerSeccion(
    reporte: ReporteDetalle
  ): string {
    const seccion =
      reporte.filtros['seccion'];

    return typeof seccion === 'string' &&
      seccion.trim().length > 0
      ? seccion
      : 'Todas';
  }

  obtenerDocente(
    reporte: ReporteDetalle
  ): string {
    const docenteId =
      reporte.filtros['docenteId'];

    if (typeof docenteId !== 'number') {
      return 'Todos';
    }

    return this.docentes.find(
      (docente) => docente.id === docenteId
    )?.nombre ?? 'Docente no identificado';
  }

  formatearFecha(
    fecha: string
  ): string {
    return new Intl.DateTimeFormat(
      'es-PE',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(new Date(fecha));
  }

  columnasResultado(
    reporte: ReporteDetalle
  ): string[] {
    if (reporte.resultado.length === 0) {
      return [];
    }

    return Object.keys(
      reporte.resultado[0]
    );
  }

  formatearClave(
    clave: string
  ): string {
    const texto = clave
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim();

    return texto.charAt(0).toUpperCase() +
      texto.slice(1);
  }

  formatearValor(
    valor: unknown
  ): string {
    if (valor === null || valor === undefined) {
      return '-';
    }

    if (typeof valor === 'boolean') {
      return valor ? 'Sí' : 'No';
    }

    return String(valor);
  }

  private generarResultadoSimulado(
    filtros: FiltroReporte
  ): Record<string, unknown>[] {
    switch (filtros.tipoReporte) {
      case 'ASISTENCIA':
        return [
          {
            estudiante: 'María López',
            grado: filtros.grado ?? 'Todos',
            seccion: filtros.seccion ?? 'Todas',
            asistencias: 38,
            tardanzas: 2,
            faltas: 1,
            porcentajeAsistencia: '92.7%'
          },
          {
            estudiante: 'José Ramírez',
            grado: filtros.grado ?? 'Todos',
            seccion: filtros.seccion ?? 'Todas',
            asistencias: 40,
            tardanzas: 1,
            faltas: 0,
            porcentajeAsistencia: '97.6%'
          },
          {
            estudiante: 'Lucía Fernández',
            grado: filtros.grado ?? 'Todos',
            seccion: filtros.seccion ?? 'Todas',
            asistencias: 36,
            tardanzas: 2,
            faltas: 3,
            porcentajeAsistencia: '87.8%'
          }
        ];

      case 'CALIFICACIONES':
        return [
          {
            estudiante: 'María López',
            curso: 'Matemática',
            promedio: 17,
            estado: 'Aprobado'
          },
          {
            estudiante: 'José Ramírez',
            curso: 'Comunicación',
            promedio: 15,
            estado: 'Aprobado'
          },
          {
            estudiante: 'Lucía Fernández',
            curso: 'Ciencia y Tecnología',
            promedio: 13,
            estado: 'Aprobado'
          }
        ];

      case 'USUARIOS':
        return [
          {
            nombreCompleto: 'Ana Torres',
            rol: 'Docente',
            estado: 'Activo',
            ultimoAcceso: '13/07/2026 08:15'
          },
          {
            nombreCompleto: 'Carlos Ruiz',
            rol: 'Docente',
            estado: 'Activo',
            ultimoAcceso: '13/07/2026 09:30'
          },
          {
            nombreCompleto: 'María López',
            rol: 'Estudiante',
            estado: 'Activo',
            ultimoAcceso: '12/07/2026 18:20'
          },
          {
            nombreCompleto: 'José Ramírez',
            rol: 'Estudiante',
            estado: 'Inactivo',
            ultimoAcceso: '05/07/2026 16:05'
          }
        ];
    }
  }

  private cargarReportesTemporales(): void {
    const datosGuardados =
      localStorage.getItem(this.storageKey);

    if (!datosGuardados) {
      return;
    }

    try {
      const datos =
        JSON.parse(datosGuardados) as ReporteDetalle[];

      this.reportes =
        Array.isArray(datos) ? datos : [];
    } catch {
      localStorage.removeItem(this.storageKey);

      this.mensajeError =
        'No se pudo recuperar el historial de reportes.';
    }
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.reportes)
    );
  }

  private generarId(): number {
    const mayorId = Math.max(
      0,
      ...this.reportes.map(
        (reporte) => reporte.reporteId
      )
    );

    return mayorId + 1;
  }

  private escaparCsv(
    valor: string
  ): string {
    const valorEscapado =
      valor.replace(/"/g, '""');

    return `"${valorEscapado}"`;
  }
}