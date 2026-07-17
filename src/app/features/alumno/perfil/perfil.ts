import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageTitle } from '../../../shared/components/page-title/page-title';
import { AlumnoApi } from '../alumno-api';

@Component({
  selector: 'app-perfil',
  imports: [PageTitle, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly api = inject(AlumnoApi);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal(false);
  readonly saveError = signal(false);
  readonly saved = signal(false);

  // Campos no editables, solo para mostrar.
  readonly fullName = signal('');
  readonly gradoSeccion = signal('');
  readonly studentId = signal(0);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.email]],
    phone: [''],
    emailNotifications: [false],
    appNotifications: [false],
  });

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (p) => {
        this.fullName.set(p.fullName);
        this.gradoSeccion.set(`${p.gradeLevel} "${p.section}"`);
        this.studentId.set(p.studentId);
        this.form.patchValue({
          email: p.email ?? '',
          phone: p.phone ?? '',
          emailNotifications: p.emailNotifications,
          appNotifications: p.appNotifications,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);
    this.saveError.set(false);

    const v = this.form.getRawValue();
    this.api
      .updateProfile({
        email: v.email.trim() || null,
        phone: v.phone.trim() || null,
        emailNotifications: v.emailNotifications,
        appNotifications: v.appNotifications,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set(true);
        },
      });
  }
}
