import { Injectable, inject } from '@angular/core';
import { Database, ref as dbRef, get, set } from '@angular/fire/database';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CloudinaryService } from '../../admin/services/cloudinary.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileImageService {
  private imageUrlSubject = new BehaviorSubject<string | null>(null);
  public imageUrl$: Observable<string | null> =
    this.imageUrlSubject.asObservable();

  private readonly FALLBACK_IMAGE_PATH = './assets/img/tomas.png';
  private cachedUrl: string | null = null;

  private db = inject(Database);
  private cloudinaryService = inject(CloudinaryService);

  constructor() {
    this.loadImageUrl().subscribe();
  }

  /**
   * Carga la URL de la imagen de perfil desde Firebase Database
   */
  loadImageUrl(): Observable<string | null> {
    // Si ya tenemos la URL en cache, la devolvemos
    if (this.cachedUrl) {
      return of(this.cachedUrl);
    }

    const pathRef = dbRef(this.db, 'profile/imageUrl');
    return from(get(pathRef)).pipe(
      map((snapshot) => {
        const url = snapshot.val();
        if (url) {
          this.cachedUrl = url;
          this.imageUrlSubject.next(url);
          return url;
        } else {
          this.cachedUrl = this.FALLBACK_IMAGE_PATH;
          this.imageUrlSubject.next(this.FALLBACK_IMAGE_PATH);
          return this.FALLBACK_IMAGE_PATH;
        }
      }),
      catchError(() => {
        // En caso de error, usamos la imagen por defecto
        this.cachedUrl = this.FALLBACK_IMAGE_PATH;
        this.imageUrlSubject.next(this.FALLBACK_IMAGE_PATH);
        return of(this.FALLBACK_IMAGE_PATH);
      })
    );
  }

  /**
   * Obtiene la URL actual de la imagen de perfil
   */
  getCurrentImageUrl(): string {
    return this.cachedUrl || this.FALLBACK_IMAGE_PATH;
  }

  /**
   * Actualiza la URL de la imagen después de una nueva subida
   */
  refreshImageUrl(): void {
    this.cachedUrl = null;
    this.loadImageUrl().subscribe();
  }

  /**
   * Sube una nueva imagen de perfil a Cloudinary y guarda su URL en Firebase Database
   */
  uploadProfileImage(file: File): Observable<number | string> {
    const progressSubject = new BehaviorSubject<number | string>(0);

    this.cloudinaryService.uploadImageWithProgress(file).subscribe({
      next: (progress) => {
        if (typeof progress === 'number') {
          progressSubject.next(progress);
        } else if (typeof progress === 'string') {
          const finalUrl = progress; // Es la URL segura de Cloudinary
          
          // Guardar esta URL en Firebase Realtime Database
          const pathRef = dbRef(this.db, 'profile/imageUrl');
          from(set(pathRef, finalUrl)).subscribe({
            next: () => {
              this.cachedUrl = finalUrl;
              this.imageUrlSubject.next(finalUrl);
              progressSubject.next(finalUrl);
              progressSubject.complete();
            },
            error: (err) => {
              console.error('Error saving profile image URL to database:', err);
              progressSubject.error('Error al guardar la URL en la base de datos');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error uploading profile image to Cloudinary:', error);
        progressSubject.error(error);
      }
    });

    return progressSubject.asObservable();
  }
}
