import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, submit, required, email } from '@angular/forms/signals';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { DocenteApi } from '../docente-api';

@Component({
  selector: 'app-perfil',
  imports: [PageTitle, FormField],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly api = inject(DocenteApi);

  protected readonly model = signal({
    nombreCompleto: '',
    correo:         '',
    rol:            '',
    asignaturas:    '',
    notifCorreo:    true,
    notifApp:       false,
  });

  protected readonly perfilForm = form(this.model, s => {
    required(s.nombreCompleto, { message: 'El nombre es obligatorio' });
    required(s.correo,         { message: 'El correo es obligatorio' });
    email(s.correo,            { message: 'Ingrese un correo electrónico válido' });
  });

  readonly guardado = signal(false);
  readonly error = signal(false);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (profile) => {
        this.model.set({
          nombreCompleto: profile.fullName,
          correo: profile.email,
          rol: profile.position,
          asignaturas: profile.subjects || '',
          notifCorreo: profile.emailNotifications,
          notifApp: profile.appNotifications,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onGuardar(): void {
    this.guardado.set(false);
    this.error.set(false);

    submit(this.perfilForm, async () => {
      this.loading.set(true);
      const val = this.model();
      this.api.updateProfile({
        fullName: val.nombreCompleto,
        email: val.correo,
        subjects: val.asignaturas,
        emailNotifications: val.notifCorreo,
        appNotifications: val.notifApp
      }).subscribe({
        next: () => {
          this.guardado.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
    });
  }
}
