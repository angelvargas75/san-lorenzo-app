import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  errorMsg: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    // Reactive Form con validaciones
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false],
    });
  }

  // Getters para acceder fácil a los campos en el HTML
  get usuario() { return this.loginForm.get('usuario'); }
  get password() { return this.loginForm.get('password'); }

  login(): void {
    // Si el formulario es inválido, marca los campos y no continúa
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const user = this.loginForm.value.usuario.trim().toLowerCase();

    // Detección de rol (misma lógica que tu HTML original)
    if (user.includes('docente')) {
      this.router.navigate(['/docente']);
    } else if (user.includes('alumno')) {
      this.router.navigate(['/alumno']);
    } else if (user.includes('coordinador')) {
      this.router.navigate(['/coordinador']);
    } else {
      this.errorMsg = "Para probar, use usuarios que contengan: 'docente', 'alumno' o 'coordinador'";
    }
  }
}