import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Señal reactiva para el usuario autenticado
  private readonly _currentUser = signal<firebase.User | null>(null);

  // Computed para saber si está autenticado
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly currentUser = computed(() => this._currentUser());

  // Inyección moderna
  private readonly afAuth = inject(AngularFireAuth);
  private readonly router = inject(Router);

  constructor() {
    // Sincroniza el usuario autenticado con la señal reactiva
    this.afAuth.authState.subscribe((user) => {
      this._currentUser.set(user);
    });
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      // La señal se actualiza automáticamente por el observable authState
      return credential;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión y redirige al login
   */
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      await this.router.navigate(['/admin/login']);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Verifica de forma síncrona si el usuario está autenticado
   */
  checkAuthSync(): boolean {
    return !!this._currentUser();
  }
}
