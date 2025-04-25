import { Injectable } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  private cvUrlSubject = new BehaviorSubject<string | null>(null);
  public cvUrl$: Observable<string | null> = this.cvUrlSubject.asObservable();

  private readonly CV_FILE_PATH = 'cv/tomasvillarruelCV.pdf';
  private cachedUrl: string | null = null;

  constructor(private storage: Storage) {
    this.loadCvUrl();
  }

  /**
   * Carga la URL del CV desde Firebase Storage
   */
  loadCvUrl(): Observable<string | null> {
    // Si ya tenemos la URL en cache, la devolvemos
    if (this.cachedUrl) {
      return of(this.cachedUrl);
    }

    // Obtenemos la referencia al archivo en Firebase Storage
    const cvRef = ref(this.storage, this.CV_FILE_PATH);

    // Obtenemos la URL de descarga
    return from(
      getDownloadURL(cvRef)
        .then((url) => {
          this.cachedUrl = url;
          this.cvUrlSubject.next(url);
          return url;
        })
        .catch((error) => {
          console.error('Error al obtener la URL del CV:', error);
          // Si hay un error, usamos la ruta local como fallback
          const fallbackUrl = '/assets/tomasvillarruelCV.pdf';
          this.cvUrlSubject.next(fallbackUrl);
          return fallbackUrl;
        })
    );
  }

  /**
   * Obtiene la URL actual del CV
   */
  getCurrentCvUrl(): string | null {
    return this.cachedUrl || '/assets/tomasvillarruelCV.pdf';
  }

  /**
   * Actualiza la URL del CV después de una nueva subida
   */
  refreshCvUrl(): void {
    this.cachedUrl = null;
    this.loadCvUrl().subscribe();
  }
}
