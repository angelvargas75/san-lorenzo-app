import { Component, inject, signal } from '@angular/core';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { DocenteApi } from '../docente-api';

@Component({
  selector: 'app-comunicaciones',
  imports: [PageTitle, FormField],
  templateUrl: './comunicaciones.html',
  styleUrl: './comunicaciones.scss',
})
export class Comunicaciones {
  private readonly api = inject(DocenteApi);

  readonly secciones = ['A', 'B', 'C'] as const;
  readonly grados    = ['3ro', '4to', '5to', '11', '12'] as const;
  readonly cursos    = ['Matemáticas', 'Física', 'Historia', 'Biología', 'Inglés'] as const;
  readonly destinatarios = ['Todos los alumnos', 'Solo alumnos', 'Padres de familia'] as const;

  protected readonly model = signal({
    seccion:       '',
    grado:         '',
    curso:         '',
    destinatarios: '',
    asunto:        '',
    mensaje:       '',
  });

  protected readonly comunicadoForm = form(this.model, s => {
    required(s.asunto,  { message: 'El asunto es obligatorio' });
    required(s.mensaje, { message: 'El mensaje no puede estar vacío' });
  });

  readonly enviado = signal(false);
  readonly error = signal(false);
  readonly loading = signal(false);

  onEnviar(): void {
    this.enviado.set(false);
    this.error.set(false);

    submit(this.comunicadoForm, async () => {
      this.loading.set(true);
      const val = this.model();
      this.api.sendAnnouncement({
        subject: val.asunto,
        message: val.mensaje,
        section: val.seccion || null,
        gradeLevel: val.grado || null,
        // no support for course string to ID translation right now as we just hardcoded the names. We'll pass null for courseId or maybe skip it since the API doesn't enforce it if section/gradeLevel are passed.
      }).subscribe({
        next: () => {
          this.enviado.set(true);
          this.loading.set(false);
          this.model.set({
            seccion: '',
            grado: '',
            curso: '',
            destinatarios: '',
            asunto: '',
            mensaje: '',
          });
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
    });
  }
}
