import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializar formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Actualizado para usar async/await
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const { email, password } = this.loginForm.value;
    this.loading = true;
    this.errorMessage = null;

    try {
      // Usar await en lugar de subscribe
      await this.authService.login(email, password);
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      // Añadir tipado explícito para err
      console.error('Error en inicio de sesión:', err);

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        this.errorMessage = 'Email o contraseña incorrectos.';
      } else if (err.code === 'auth/too-many-requests') {
        this.errorMessage = 'Demasiados intentos. Inténtelo más tarde.';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Inténtelo de nuevo.';
      }
    } finally {
      this.loading = false;
    }
  }
}
