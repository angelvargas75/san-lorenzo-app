import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PageTitle } from '../../../shared/components/page-title/page-title';
import { ConfiguracionInstitucional } from '../models/configuracion.model';

@Component({
  selector: 'app-configuracion',
  imports: [
    PageTitle,
    ReactiveFormsModule
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss'
})
export class Configuracion implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storageKey = 'configuracion-institucional';

  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  readonly configuracionForm = this.formBuilder.nonNullable.group({
    nombreInstitucion: [
      'IEP Santiago Apóstol',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150)
      ]
    ],

    anioAcademico: [
      2026,
      [
        Validators.required,
        Validators.min(2020),
        Validators.max(2100)
      ]
    ],

    periodoAcademico: [
      'Segundo bimestre',
      Validators.required
    ],

    toleranciaMinutos: [
      10,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(120)
      ]
    ],

    umbralInasistencias: [
      3,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]
    ]
  });

  ngOnInit(): void {
    this.cargarConfiguracionTemporal();
  }

  get controles() {
    return this.configuracionForm.controls;
  }

  guardarConfiguracion(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.configuracionForm.invalid) {
      this.configuracionForm.markAllAsTouched();
      this.mensajeError =
        'Revise los campos marcados antes de guardar.';
      return;
    }

    this.guardando = true;

    const configuracion: ConfiguracionInstitucional = {
      configuracionId: 1,
      ...this.configuracionForm.getRawValue(),
      fechaActualizacion: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(configuracion)
      );

      this.mensajeExito =
        'Configuración guardada correctamente de manera temporal.';
    } catch (error) {
      console.error(
        'No se pudo guardar la configuración:',
        error
      );

      this.mensajeError =
        'No se pudo guardar la configuración.';
    } finally {
      this.guardando = false;
    }
  }

  private cargarConfiguracionTemporal(): void {
    try {
      const configuracionGuardada =
        localStorage.getItem(this.storageKey);

      if (!configuracionGuardada) {
        return;
      }

      const configuracion =
        JSON.parse(
          configuracionGuardada
        ) as ConfiguracionInstitucional;

      this.configuracionForm.patchValue({
        nombreInstitucion:
          configuracion.nombreInstitucion,

        anioAcademico:
          configuracion.anioAcademico,

        periodoAcademico:
          configuracion.periodoAcademico,

        toleranciaMinutos:
          configuracion.toleranciaMinutos,

        umbralInasistencias:
          configuracion.umbralInasistencias
      });
    } catch (error) {
      console.error(
        'No se pudo cargar la configuración:',
        error
      );

      this.mensajeError =
        'No se pudo recuperar la configuración guardada.';
    }
  }
}
