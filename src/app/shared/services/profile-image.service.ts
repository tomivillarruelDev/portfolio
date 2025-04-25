import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  getMetadata,
} from '@angular/fire/storage';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileImageService {
  private imageUrlSubject = new BehaviorSubject<string | null>(null);
  public imageUrl$: Observable<string | null> =
    this.imageUrlSubject.asObservable();

  private readonly IMAGE_FILE_PATH = 'profile/profileImage.png';
  private readonly FALLBACK_IMAGE_PATH = './assets/img/tomas.png';
  private cachedUrl: string | null = null;

  // Flag para recordar si ya verificamos que la imagen no existe
  private imageChecked: boolean = false;
  private imageExists: boolean = false;

  constructor(private storage: Storage) {
    this.loadImageUrl().subscribe();
  }

  /**
   * Verifica si la imagen de perfil existe en Firebase Storage
   */
  private checkIfImageExists(): Observable<boolean> {
    // Si ya verificamos anteriormente, devolvemos el resultado almacenado
    if (this.imageChecked) {
      return of(this.imageExists);
    }

    const imageRef = ref(this.storage, this.IMAGE_FILE_PATH);

    return from(
      getMetadata(imageRef)
        .then(() => {
          // La imagen existe
          this.imageChecked = true;
          this.imageExists = true;
          return true;
        })
        .catch(() => {
          // La imagen no existe
          this.imageChecked = true;
          this.imageExists = false;
          return false;
        })
    );
  }

  /**
   * Carga la URL de la imagen de perfil desde Firebase Storage
   */
  loadImageUrl(): Observable<string | null> {
    // Si ya tenemos la URL en cache, la devolvemos
    if (this.cachedUrl) {
      return of(this.cachedUrl);
    }

    // Primero verificamos si la imagen existe
    return this.checkIfImageExists().pipe(
      switchMap((exists) => {
        if (exists) {
          // La imagen existe, obtenemos su URL
          const imageRef = ref(this.storage, this.IMAGE_FILE_PATH);
          return from(getDownloadURL(imageRef)).pipe(
            tap((url) => {
              this.cachedUrl = url;
              this.imageUrlSubject.next(url);
            }),
            catchError(() => {
              // En caso de error, usamos la imagen por defecto
              this.cachedUrl = this.FALLBACK_IMAGE_PATH;
              this.imageUrlSubject.next(this.FALLBACK_IMAGE_PATH);
              return of(this.FALLBACK_IMAGE_PATH);
            })
          );
        } else {
          // La imagen no existe, usamos la imagen por defecto sin intentar cargarla de nuevo
          console.log('La imagen no existe, usando imagen por defecto');
          this.cachedUrl = this.FALLBACK_IMAGE_PATH;
          this.imageUrlSubject.next(this.FALLBACK_IMAGE_PATH);
          return of(this.FALLBACK_IMAGE_PATH);
        }
      }),
      catchError(() => {
        // En caso de error general, usamos la imagen por defecto
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
    this.imageChecked = false; // Resetear el flag para volver a verificar
    this.loadImageUrl().subscribe();
  }

  /**
   * Sube una nueva imagen de perfil a Firebase Storage
   */
  uploadProfileImage(file: File): Observable<number | string> {
    const progressSubject = new BehaviorSubject<number>(0);
    const storageRef = ref(this.storage, this.IMAGE_FILE_PATH);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Actualizar progreso
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressSubject.next(progress);
      },
      (error) => {
        // Manejar error
        console.error('Error al subir la imagen de perfil:', error);
        progressSubject.error('Error al subir la imagen');
      },
      () => {
        // Completado exitosamente
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          this.cachedUrl = downloadURL;
          this.imageUrlSubject.next(downloadURL);
          // Actualizar el estado de verificación
          this.imageChecked = true;
          this.imageExists = true;
          progressSubject.next(100);
          progressSubject.complete();
        });
      }
    );

    return progressSubject.asObservable();
  }
}
