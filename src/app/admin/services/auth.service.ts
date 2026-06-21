import { Injectable, inject, signal, computed } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<firebase.User | null>(null);
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly currentUser = computed(() => this._currentUser());

  private readonly afAuth = inject(AngularFireAuth);
  private readonly router = inject(Router);

  constructor() {
    this.afAuth.authState.subscribe((user) => {
      this._currentUser.set(user);
    });
  }

  async login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return credential;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      await this.router.navigate(['/admin/login']);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  checkAuthSync(): boolean {
    return !!this._currentUser();
  }

  getAuthState(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }
}
