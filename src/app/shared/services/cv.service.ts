import { Injectable, inject } from '@angular/core';
import { Database, ref as dbRef, get, set } from '@angular/fire/database';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CloudinaryService } from '../../admin/services/cloudinary.service';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  private cvUrlSubject = new BehaviorSubject<string | null>(null);
  public cvUrl$: Observable<string | null> = this.cvUrlSubject.asObservable();

  private readonly FALLBACK_CV_PATH = '/assets/tomasvillarruelCV.pdf';
  private cachedUrl: string | null = null;

  private db = inject(Database);
  private cloudinaryService = inject(CloudinaryService);

  constructor() {
    this.loadCvUrl().subscribe();
  }

  /**
   * Carga la URL del CV desde la base de datos de Firebase
   */
  loadCvUrl(): Observable<string | null> {
    if (this.cachedUrl) {
      return of(this.cachedUrl);
    }

    const pathRef = dbRef(this.db, 'cv/url');
    return from(get(pathRef)).pipe(
      map((snapshot) => {
        const url = snapshot.val();
        if (url) {
          this.cachedUrl = url;
          this.cvUrlSubject.next(url);
          return url;
        } else {
          this.cachedUrl = this.FALLBACK_CV_PATH;
          this.cvUrlSubject.next(this.FALLBACK_CV_PATH);
          return this.FALLBACK_CV_PATH;
        }
      }),
      catchError(() => {
        this.cachedUrl = this.FALLBACK_CV_PATH;
        this.cvUrlSubject.next(this.FALLBACK_CV_PATH);
        return of(this.FALLBACK_CV_PATH);
      })
    );
  }

  /**
   * Obtiene la fecha de última actualización del CV desde la base de datos
   */
  getMetadata(): Observable<any> {
    const pathRef = dbRef(this.db, 'cv/lastUpdated');
    return from(get(pathRef)).pipe(
      map((snapshot) => {
        const lastUpdated = snapshot.val();
        return lastUpdated ? { updated: lastUpdated } : null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Obtiene la URL actual del CV
   */
  getCurrentCvUrl(): string | null {
    return this.cachedUrl || this.FALLBACK_CV_PATH;
  }

  /**
   * Actualiza la URL del CV después de una nueva subida
   */
  refreshCvUrl(): void {
    this.cachedUrl = null;
    this.loadCvUrl().subscribe();
  }

  /**
   * Sube una nueva versión del CV a Cloudinary y guarda su URL en Firebase
   */
  uploadCv(file: File): Observable<number | string> {
    const progressSubject = new BehaviorSubject<number | string>(0);

    this.cloudinaryService.uploadImageWithProgress(file).subscribe({
      next: (progress) => {
        if (typeof progress === 'number') {
          progressSubject.next(progress);
        } else if (typeof progress === 'string') {
          const finalUrl = progress;
          
          const pathRef = dbRef(this.db, 'cv');
          const cvData = {
            url: finalUrl,
            lastUpdated: new Date().toISOString()
          };

          from(set(pathRef, cvData)).subscribe({
            next: () => {
              this.cachedUrl = finalUrl;
              this.cvUrlSubject.next(finalUrl);
              progressSubject.next(finalUrl);
              progressSubject.complete();
            },
            error: (err) => {
              console.error('Error al guardar los datos del CV en la base de datos:', err);
              progressSubject.error('Error al guardar la información del CV en la base de datos');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al subir el CV a Cloudinary:', error);
        progressSubject.error('Error al subir el CV a Cloudinary');
      }
    });

    return progressSubject.asObservable();
  }
}
