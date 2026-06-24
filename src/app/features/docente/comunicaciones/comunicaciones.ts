import { Component, signal } from '@angular/core';
import { form, FormField, submit, required } from '@angular/forms/signals';
import { PageTitle } from '../../../shared/components/page-title/page-title';

@Component({
  selector: 'app-comunicaciones',
  imports: [PageTitle, FormField],
  templateUrl: './comunicaciones.html',
  styleUrl: './comunicaciones.scss',
})
export class Comunicaciones {
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

  onEnviar(): void {
    this.enviado.set(false);
    submit(this.comunicadoForm, async () => {
      this.enviado.set(true);
    });
  }
}
