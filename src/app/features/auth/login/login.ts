import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiProblem } from '../../../core/models/auth.model';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly loginForm: FormGroup;
  errorMsg = '';
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly auth: Auth,
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      remember: [false],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login(): void {
    this.errorMsg = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const {
      email,
      password,
      remember,
    } = this.loginForm.getRawValue();

    this.isLoading = true;

    this.auth
      .login(
        {
          email: email.trim(),
          password,
        },
        Boolean(remember),
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          void this.router.navigate([
            this.auth.getHomeRoute(response.user.role),
          ]);
        },
        error: (error: HttpErrorResponse) => {
          const problem = error.error as ApiProblem | null;

          this.errorMsg =
            problem?.detail ??
            'No fue posible iniciar sesión. Verifique sus credenciales y la conexión con el servidor.';
        },
      });
  }
}
