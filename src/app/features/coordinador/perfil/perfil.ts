import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PageTitle } from '../../../shared/components/page-title/page-title';
import { PerfilCoordinador } from '../models/perfil-coordinador.model';

@Component({
  selector: 'app-perfil',
  imports: [
    PageTitle,
    ReactiveFormsModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storageKey = 'perfil-coordinador';

  readonly rol = 'Coordinador académico';

  mensajeExito = '';
  mensajeError = '';

  readonly perfilForm = this.formBuilder.nonNullable.group({
    nombres: [
      'Coordinador',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60),
        Validators.pattern(
          /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/
        )
      ]
    ],

    apellidos: [
      'Académico',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60),
        Validators.pattern(
          /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/
        )
      ]
    ],

    correo: [
      'coordinador@santiagoapostol.edu.pe',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(120)
      ]
    ],

    telefono: [
      '',
      [
        Validators.maxLength(20),
        Validators.pattern(/^[0-9+\s()-]{7,20}$/)
      ]
    ],

    areaGestion: [
      'Gestión académica',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]
    ],

    notificacionesCorreo: [true],
    notificacionesSistema: [false]
  });

  ngOnInit(): void {
    this.cargarPerfilTemporal();
  }

  get controles() {
    return this.perfilForm.controls;
  }

  guardarPerfil(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();

      this.mensajeError =
        'Revisa los campos señalados antes de guardar el perfil.';

      return;
    }

    const datosFormulario = this.perfilForm.getRawValue();

    const perfil: PerfilCoordinador = {
      usuarioId: 1,
      nombres: datosFormulario.nombres.trim(),
      apellidos: datosFormulario.apellidos.trim(),
      correo: datosFormulario.correo.trim().toLowerCase(),
      telefono:
        datosFormulario.telefono.trim() || null,
      rol: this.rol,
      areaGestion:
        datosFormulario.areaGestion.trim() || null,
      notificacionesCorreo:
        datosFormulario.notificacionesCorreo,
      notificacionesSistema:
        datosFormulario.notificacionesSistema
    };

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(perfil)
    );

    this.mensajeExito =
      'El perfil se guardó correctamente.';
  }

  private cargarPerfilTemporal(): void {
    const perfilGuardado =
      localStorage.getItem(this.storageKey);

    if (!perfilGuardado) {
      return;
    }

    try {
      const perfil =
        JSON.parse(perfilGuardado) as Partial<PerfilCoordinador>;

      this.perfilForm.patchValue({
        nombres:
          perfil.nombres ?? 'Coordinador',

        apellidos:
          perfil.apellidos ?? 'Académico',

        correo:
          perfil.correo ??
          'coordinador@santiagoapostol.edu.pe',

        telefono:
          perfil.telefono ?? '',

        areaGestion:
          perfil.areaGestion ?? 'Gestión académica',

        notificacionesCorreo:
          perfil.notificacionesCorreo ?? true,

        notificacionesSistema:
          perfil.notificacionesSistema ?? false
      });
    } catch {
      localStorage.removeItem(this.storageKey);

      this.mensajeError =
        'No se pudieron recuperar los datos guardados anteriormente.';
    }
  }
}