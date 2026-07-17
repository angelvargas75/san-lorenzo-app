import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { CoordinadorApi } from '../coordinador-api';

interface ComunicadoViewModel {
  id: number;
  titulo: string;
  contenido: string;
  audiencia: string;
  grado: string | null;
  fechaProgramada: string;
}

@Component({
  selector: 'app-comunicados',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitle],
  templateUrl: './comunicados.html',
  styleUrl: './comunicados.scss',
})
export class Comunicados implements OnInit {
  private readonly api = inject(CoordinadorApi);

  // Estado de la lista
  readonly comunicados = signal<ComunicadoViewModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  // Estado del formulario
  readonly enviando = signal(false);
  
  // Modelo del formulario (enlazado con ngModel)
  formulario = {
    subject: '',
    body: '',
    audience: '',
    gradeLevel: '',
    fecha: '',
    hora: ''
  };

  ngOnInit(): void {
    this.cargarComunicados();
  }

  cargarComunicados(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.getComunicados().subscribe({
      next: (data) => {
        this.comunicados.set(data.map(c => ({
          id: c.id,
          titulo: c.subject,
          contenido: c.body,
          audiencia: c.audience,
          grado: c.gradeLevel,
          fechaProgramada: c.scheduledFor
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  programarEnvio(): void {
    if (!this.formulario.subject || !this.formulario.body || !this.formulario.audience || !this.formulario.fecha || !this.formulario.hora) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    // El backend espera 'scheduledFor' en formato ISO (Date-Time)
    const fechaHoraISO = new Date(`${this.formulario.fecha}T${this.formulario.hora}`).toISOString();

    const payload = {
      subject: this.formulario.subject,
      body: this.formulario.body,
      audience: this.formulario.audience,
      gradeLevel: this.formulario.gradeLevel || null,
      scheduledFor: fechaHoraISO
    };

    this.enviando.set(true);
    this.api.crearComunicado(payload).subscribe({
      next: () => {
        // Limpiar formulario
        this.formulario = { subject: '', body: '', audience: '', gradeLevel: '', fecha: '', hora: '' };
        this.enviando.set(false);
        // Recargar la lista para ver el nuevo comunicado
        this.cargarComunicados();
      },
      error: (err) => {
        console.error('Error al crear comunicado', err);
        this.enviando.set(false);
        alert('Ocurrió un error al programar el comunicado.');
      }
    });
  }
}