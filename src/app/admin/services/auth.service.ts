import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app'; // Importar firebase para UserCredential

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Usar un tipo más específico para el estado de autenticación (User | null)
  private authStateSubject = new BehaviorSubject<firebase.User | null>(null);
  // Exponer un observable del usuario actual, no solo un booleano
  currentUser$: Observable<firebase.User | null> =
    this.authStateSubject.asObservable();
  // Exponer un observable booleano para conveniencia en plantillas/guards
  isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => !!user)
  );

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.afAuth.authState.subscribe((user) => {
      this.authStateSubject.next(user);
    });
  }

  /**
   * Inicia sesión con email y contraseña usando async/await.
   */
  async login(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      // El observable authState se actualizará automáticamente por la suscripción en el constructor
      // No es necesario llamar a this.authStateSubject.next(true) aquí
      return credential;
    } catch (error) {
      console.error('Login failed:', error);
      // Relanzar el error para que el componente que llama pueda manejarlo
      throw error; // O un error más específico/amigable
    }
  }

  /**
   * Cierra la sesión usando async/await y redirige al login.
   */
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      // El observable authState se actualizará automáticamente
      // Redirigir después del cierre de sesión exitoso
      await this.router.navigate(['/admin/login']);
    } catch (error) {
      console.error('Logout failed:', error);
      // Considerar si se debe relanzar o manejar aquí
      throw error;
    }
  }

  /**
   * Verifica de forma síncrona si el usuario está autenticado.
   * Útil para guards síncronos, pero prefiere usar el observable isAuthenticated$ cuando sea posible.
   */
  checkAuthSync(): boolean {
    return !!this.authStateSubject.value;
  }

  // Eliminar isAuthenticated() ya que isAuthenticated$ es la forma reactiva preferida.
  // isAuthenticated(): Observable<boolean> { ... }

  // Renombrar checkAuth a checkAuthSync para claridad.
  // checkAuth(): boolean { ... }
}
