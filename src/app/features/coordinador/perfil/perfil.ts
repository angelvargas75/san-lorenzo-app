import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { CoordinadorApi } from '../coordinador-api';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitle],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly api = inject(CoordinadorApi);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly guardando = signal(false);

  formulario = {
    fullName: '',
    email: '',
    emailNotifications: false,
    appNotifications: false
  };

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.getPerfil().subscribe({
      next: (data) => {
        this.formulario = {
          fullName: data.fullName,
          email: data.email,
          emailNotifications: data.emailNotifications,
          appNotifications: data.appNotifications
        };
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  guardarPerfil(): void {
    this.guardando.set(true);
    this.api.actualizarPerfil(this.formulario).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Perfil guardado con éxito.');
      },
      error: (err) => {
        console.error('Error al guardar perfil', err);
        this.guardando.set(false);
        alert('Ocurrió un error al guardar el perfil.');
      }
    });
  }
}