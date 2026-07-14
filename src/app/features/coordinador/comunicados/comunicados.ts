import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PageTitle } from '../../../shared/components/page-title/page-title';
import {
  Comunicado,
  EstadoComunicado
} from '../models/comunicado.model';

@Component({
  selector: 'app-comunicados',
  imports: [
    PageTitle,
    ReactiveFormsModule
  ],
  templateUrl: './comunicados.html',
  styleUrl: './comunicados.scss',
})
export class Comunicados implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storageKey = 'comunicados-coordinador';

  readonly estados: EstadoComunicado[] = [
    'BORRADOR',
    'PROGRAMADO',
    'ENVIADO',
    'CANCELADO'
  ];

  readonly roles = [
    {
      value: 'PADRE_FAMILIA',
      label: 'Padres de familia'
    },
    {
      value: 'ALUMNO',
      label: 'Estudiantes'
    },
    {
      value: 'DOCENTE',
      label: 'Docentes'
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

  comunicados: Comunicado[] = [];
  comunicadoEditandoId: number | null = null;

  mensajeExito = '';
  mensajeError = '';

  readonly comunicadoForm = this.formBuilder.nonNullable.group({
    titulo: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]
    ],

    contenido: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(4000)
      ]
    ],

    rol: [
      '',
      Validators.required
    ],

    grado: [''],
    seccion: [''],

    estado: [
      'BORRADOR' as EstadoComunicado,
      Validators.required
    ],

    fechaEnvio: [''],
    horaEnvio: ['']
  });

  readonly filtroForm = this.formBuilder.nonNullable.group({
    estado: [''],
    rol: ['']
  });

  ngOnInit(): void {
    this.cargarComunicadosTemporales();
  }

  get controles() {
    return this.comunicadoForm.controls;
  }

  get comunicadosFiltrados(): Comunicado[] {
    const filtros = this.filtroForm.getRawValue();

    return [...this.comunicados]
      .filter((comunicado) => {
        const coincideEstado =
          !filtros.estado ||
          comunicado.estado === filtros.estado;

        const coincideRol =
          !filtros.rol ||
          comunicado.destinatarios.some(
            (destinatario) =>
              destinatario.rol === filtros.rol
          );

        return coincideEstado && coincideRol;
      })
      .sort((a, b) => {
        const fechaA = new Date(
          a.fechaCreacion ?? 0
        ).getTime();

        const fechaB = new Date(
          b.fechaCreacion ?? 0
        ).getTime();

        return fechaB - fechaA;
      });
  }

  guardarComunicado(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.comunicadoForm.invalid) {
      this.comunicadoForm.markAllAsTouched();

      this.mensajeError =
        'Revisa los campos obligatorios antes de guardar.';

      return;
    }

    const datos = this.comunicadoForm.getRawValue();

    if (
      datos.estado === 'PROGRAMADO' &&
      (!datos.fechaEnvio || !datos.horaEnvio)
    ) {
      this.mensajeError =
        'Los comunicados programados requieren fecha y hora de envío.';

      return;
    }

    const fechaProgramada =
      datos.fechaEnvio && datos.horaEnvio
        ? new Date(
            `${datos.fechaEnvio}T${datos.horaEnvio}:00`
          ).toISOString()
        : null;

    if (
      datos.estado === 'PROGRAMADO' &&
      fechaProgramada &&
      new Date(fechaProgramada).getTime() <= Date.now()
    ) {
      this.mensajeError =
        'La fecha programada debe ser posterior al momento actual.';

      return;
    }

    const destinatarios = [
      {
        rol: datos.rol,
        grado: datos.grado || null,
        seccion: datos.seccion || null
      }
    ];

    if (this.comunicadoEditandoId !== null) {
      const indice = this.comunicados.findIndex(
        (comunicado) =>
          comunicado.comunicadoId ===
          this.comunicadoEditandoId
      );

      if (indice === -1) {
        this.mensajeError =
          'No se encontró el comunicado que se estaba editando.';

        return;
      }

      const comunicadoAnterior =
        this.comunicados[indice];

      const comunicadoActualizado: Comunicado = {
        ...comunicadoAnterior,
        titulo: datos.titulo.trim(),
        contenido: datos.contenido.trim(),
        estado: datos.estado,
        fechaProgramada,
        destinatarios
      };

      this.comunicados[indice] =
        comunicadoActualizado;

      this.mensajeExito =
        'El comunicado se actualizó correctamente.';
    } else {
      const nuevoComunicado: Comunicado = {
        comunicadoId: this.generarId(),
        titulo: datos.titulo.trim(),
        contenido: datos.contenido.trim(),
        estado: datos.estado,
        fechaProgramada,
        creadoPorUsuarioId: 1,
        fechaCreacion: new Date().toISOString(),
        destinatarios
      };

      this.comunicados.push(nuevoComunicado);

      this.mensajeExito =
        datos.estado === 'PROGRAMADO'
          ? 'El comunicado se programó correctamente.'
          : 'El comunicado se guardó correctamente.';
    }

    this.guardarEnLocalStorage();
    this.reiniciarFormulario();
  }

  editarComunicado(comunicado: Comunicado): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.comunicadoEditandoId =
      comunicado.comunicadoId ?? null;

    const destinatario =
      comunicado.destinatarios[0];

    let fechaEnvio = '';
    let horaEnvio = '';

    if (comunicado.fechaProgramada) {
      const fecha = new Date(
        comunicado.fechaProgramada
      );

      fechaEnvio = this.formatearFechaInput(fecha);
      horaEnvio = this.formatearHoraInput(fecha);
    }

    this.comunicadoForm.patchValue({
      titulo: comunicado.titulo,
      contenido: comunicado.contenido,
      rol: destinatario?.rol ?? '',
      grado: destinatario?.grado ?? '',
      seccion: destinatario?.seccion ?? '',
      estado: comunicado.estado,
      fechaEnvio,
      horaEnvio
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelarEdicion(): void {
    this.mensajeError = '';
    this.reiniciarFormulario();
  }

  cancelarComunicado(
    comunicado: Comunicado
  ): void {
    if (comunicado.comunicadoId === undefined) {
      return;
    }

    this.comunicados = this.comunicados.map(
      (elemento) =>
        elemento.comunicadoId ===
        comunicado.comunicadoId
          ? {
              ...elemento,
              estado: 'CANCELADO'
            }
          : elemento
    );

    this.guardarEnLocalStorage();

    this.mensajeExito =
      'El comunicado fue cancelado.';
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      estado: '',
      rol: ''
    });
  }

  etiquetaEstado(
    estado: EstadoComunicado
  ): string {
    const etiquetas: Record<
      EstadoComunicado,
      string
    > = {
      BORRADOR: 'Borrador',
      PROGRAMADO: 'Programado',
      ENVIADO: 'Enviado',
      CANCELADO: 'Cancelado'
    };

    return etiquetas[estado];
  }

  etiquetaRol(rol?: string | null): string {
    return this.roles.find(
      (elemento) => elemento.value === rol
    )?.label ?? rol ?? 'Todos';
  }

  resumenDestinatarios(
    comunicado: Comunicado
  ): string {
    const destinatario =
      comunicado.destinatarios[0];

    if (!destinatario) {
      return 'Sin destinatarios';
    }

    const partes = [
      this.etiquetaRol(destinatario.rol),
      destinatario.grado,
      destinatario.seccion
        ? `Sección ${destinatario.seccion}`
        : null
    ].filter(Boolean);

    return partes.join(' · ');
  }

  formatearFecha(
    fecha?: string | null
  ): string {
    if (!fecha) {
      return 'Sin programar';
    }

    return new Intl.DateTimeFormat(
      'es-PE',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(new Date(fecha));
  }

  private cargarComunicadosTemporales(): void {
    const datosGuardados =
      localStorage.getItem(this.storageKey);

    if (!datosGuardados) {
      return;
    }

    try {
      const datos =
        JSON.parse(datosGuardados) as Comunicado[];

      this.comunicados =
        Array.isArray(datos) ? datos : [];
    } catch {
      localStorage.removeItem(this.storageKey);

      this.mensajeError =
        'No se pudo recuperar el historial de comunicados.';
    }
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.comunicados)
    );
  }

  private generarId(): number {
    const mayorId = Math.max(
      0,
      ...this.comunicados.map(
        (comunicado) =>
          comunicado.comunicadoId ?? 0
      )
    );

    return mayorId + 1;
  }

  private reiniciarFormulario(): void {
    this.comunicadoEditandoId = null;

    this.comunicadoForm.reset({
      titulo: '',
      contenido: '',
      rol: '',
      grado: '',
      seccion: '',
      estado: 'BORRADOR',
      fechaEnvio: '',
      horaEnvio: ''
    });
  }

  private formatearFechaInput(
    fecha: Date
  ): string {
    const anio = fecha.getFullYear();
    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      fecha.getDate()
    ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private formatearHoraInput(
    fecha: Date
  ): string {
    const horas = String(
      fecha.getHours()
    ).padStart(2, '0');

    const minutos = String(
      fecha.getMinutes()
    ).padStart(2, '0');

    return `${horas}:${minutos}`;
  }
}