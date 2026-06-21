import { Component, signal, computed, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit, OnDestroy {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly isFormInvalid = computed(() => this.loginForm.invalid);

  constructor() {
    effect(() => {
      this.loginForm.valueChanges.subscribe(() => {
        if (this.errorMessage()) this.errorMessage.set(null);
      });
    });
  }

  ngOnInit(): void {
    document.body.classList.add('admin-mode');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('admin-mode');
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor, complete todos los campos correctamente.');
      return;
    }
    const { email, password } = this.loginForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(email!, password!);
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        this.errorMessage.set('Email o contrasena incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        this.errorMessage.set('Demasiados intentos. Intentelo mas tarde.');
      } else {
        this.errorMessage.set('Error al iniciar sesion. Intentelo de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
