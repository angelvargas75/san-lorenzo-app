import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false],
    });
  }

  get usuario() { return this.loginForm.get('usuario'); }
  get password() { return this.loginForm.get('password'); }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const user = this.loginForm.value.usuario.trim().toLowerCase();

    if (user.includes('docente')) {
      this.auth.login('docente');
      this.router.navigate(['/docente']);
    } else if (user.includes('alumno')) {
      this.auth.login('alumno');
      this.router.navigate(['/alumno']);
    } else if (user.includes('coordinador')) {
      this.auth.login('coordinador');
      this.router.navigate(['/coordinador']);
    } else {
      this.errorMsg = "Para probar, use usuarios que contengan: 'docente', 'alumno' o 'coordinador'";
    }
  }
}