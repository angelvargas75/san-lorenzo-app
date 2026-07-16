import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  readonly errorMsg = signal('');
  readonly loading = signal(false);

  readonly loginForm = this.fb.group({
    usuario: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
  });

  get usuario() {
    return this.loginForm.get('usuario');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { usuario, password } = this.loginForm.getRawValue();
    this.errorMsg.set('');
    this.loading.set(true);

    this.auth.login(usuario!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.auth.homePath());
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.status === 401
            ? 'El correo o la contraseña no son correctos.'
            : 'No se pudo iniciar sesión. Intenta de nuevo.',
        );
      },
    });
  }
}
