import { Injectable, NgZone } from '@angular/core';
import {
  Storage,
  ref,
  getDownloadURL,
  StorageReference,
  getMetadata,
} from '@angular/fire/storage';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injector } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  private cvUrlSubject = new BehaviorSubject<string | null>(null);
  public cvUrl$: Observable<string | null> = this.cvUrlSubject.asObservable();

  private readonly CV_FILE_PATH = 'cv/tomasvillarruelCV.pdf';
  private cachedUrl: string | null = null;

  constructor(
    private storage: Storage,
    private injector: Injector,
    private ngZone: NgZone
  ) {
    // Inicializar la URL del CV al cargar el servicio
    this.loadCvUrl().subscribe();
  }

  /**
   * Carga la URL del CV desde Firebase Storage
   */
  loadCvUrl(): Observable<string | null> {
    // Si ya tenemos la URL en cache, la devolvemos
    if (this.cachedUrl) {
      return of(this.cachedUrl);
    }

    // Ejecutar fuera de la zona de Angular para evitar problemas de detección de cambios
    return this.runFirebaseOperation(() => {
      // Obtenemos la referencia al archivo en Firebase Storage
      const cvRef = ref(this.storage, this.CV_FILE_PATH);

      // Convertimos la promesa en observable
      return from(getDownloadURL(cvRef));
    }).pipe(
      map((url) => {
        this.cachedUrl = url;
        this.cvUrlSubject.next(url);
        return url;
      }),
      catchError((error) => {
        console.error('Error al obtener la URL del CV:', error);
        // Si hay un error, usamos la ruta local como fallback
        const fallbackUrl = '/assets/tomasvillarruelCV.pdf';
        this.cvUrlSubject.next(fallbackUrl);
        return of(fallbackUrl);
      })
    );
  }

  /**
   * Obtiene los metadatos del archivo CV
   */
  getMetadata(): Observable<any> {
    return this.runFirebaseOperation(() => {
      const cvRef = ref(this.storage, this.CV_FILE_PATH);
      return from(getMetadata(cvRef));
    }).pipe(
      catchError((error) => {
        console.error('Error al obtener los metadatos del CV:', error);
        return of(null);
      })
    );
  }

  /**
   * Método auxiliar para ejecutar operaciones de Firebase fuera de la zona de Angular
   */
  private runFirebaseOperation<T>(
    operation: () => Observable<T>
  ): Observable<T> {
    return new Observable<T>((observer) => {
      this.ngZone.runOutsideAngular(() => {
        operation().subscribe({
          next: (result) => {
            // Volvemos a la zona de Angular para actualizar la UI
            this.ngZone.run(() => {
              observer.next(result);
              observer.complete();
            });
          },
          error: (error) => {
            this.ngZone.run(() => {
              observer.error(error);
            });
          },
        });
      });
    });
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

  /**
   * Obtiene la referencia al archivo del CV
   */
  getCvReference(): StorageReference {
    return ref(this.storage, this.CV_FILE_PATH);
  }
}
