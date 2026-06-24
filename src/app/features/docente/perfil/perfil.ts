import { Component, signal } from '@angular/core';
import { form, FormField, submit, required, email } from '@angular/forms/signals';
import { PageTitle } from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-perfil',
  imports: [PageTitle, FormField],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
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

  onGuardar(): void {
    this.guardado.set(false);
    submit(this.perfilForm, async () => {
      this.guardado.set(true);
    });
  }
}
