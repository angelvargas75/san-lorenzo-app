import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { CoordinadorApi } from '../coordinador-api';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitle],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
  private readonly api = inject(CoordinadorApi);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly guardando = signal(false);

  // Modelo enlazado con ngModel (usando los campos en inglés que espera la API)
  formulario = {
    schoolName: '',
    academicYear: new Date().getFullYear(),
    currentTerm: '',
    unjustifiedAbsenceThreshold: 0,
    latenessToleranceMinutes: 0
  };

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.getConfiguracion().subscribe({
      next: (data) => {
        this.formulario = {
          schoolName: data.schoolName,
          academicYear: data.academicYear,
          currentTerm: data.currentTerm,
          unjustifiedAbsenceThreshold: data.unjustifiedAbsenceThreshold,
          latenessToleranceMinutes: data.latenessToleranceMinutes
        };
        this.loading.set(false);
      },
            error: () => {
        // Si falla el GET (500), inicializamos con valores por defecto 
        // para que puedas intentar hacer un PUT y crear el registro
        this.formulario = {
          schoolName: 'IEP San Lorenzo',
          academicYear: new Date().getFullYear(),
          currentTerm: 'Bimestre 1',
          unjustifiedAbsenceThreshold: 3,
          latenessToleranceMinutes: 10
        };
        this.loading.set(false);
      }
    });
  }

  guardarCambios(): void {
    this.guardando.set(true);
    this.api.actualizarConfiguracion(this.formulario).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Configuración guardada con éxito.');
      },
      error: (err) => {
        console.error('Error al guardar configuración', err);
        this.guardando.set(false);
        alert('Ocurrió un error al guardar la configuración.');
      }
    });
  }
}