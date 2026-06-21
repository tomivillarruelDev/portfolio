import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { firstValueFrom, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  // Configuración de tu cuenta de Cloudinary
  private cloudName = 'dcfcee5za';

  // IMPORTANTE: Debes crear un Upload Preset de tipo "Unsigned" en la configuración de Cloudinary
  // y colocar su nombre aquí (por ejemplo, 'portfolio_preset' o 'ml_default')
  private uploadPreset = 'preset_portfolio';

  constructor(private http: HttpClient) {}

  /**
   * Sube una imagen directamente a Cloudinary y retorna su URL segura.
   * @param file El archivo de imagen a subir.
   * @returns Promesa con la URL segura de la imagen.
   */
  async uploadImage(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const response = await firstValueFrom(
        this.http.post<{ secure_url: string }>(url, formData)
      );

      if (response && response.secure_url) {
        return response.secure_url;
      }
      throw new Error('Respuesta inválida de Cloudinary');
    } catch (error) {
      console.error('Error al subir imagen a Cloudinary:', error);
      throw new Error('No se pudo subir la imagen a Cloudinary');
    }
  }

  /**
   * Sube una imagen a Cloudinary reportando el progreso de la carga.
   * @param file El archivo de imagen a subir.
   * @returns Observable que emite números (porcentaje de 0 a 100) y finalmente la URL segura de la imagen (string).
   */
  uploadImageWithProgress(file: File): Observable<number | string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    const progressSubject = new Subject<number | string>();

    this.http.request<any>(req).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(
            (100 * event.loaded) / (event.total || 1)
          );
          progressSubject.next(percentDone);
        } else if (event.type === HttpEventType.Response) {
          if (event.body && event.body.secure_url) {
            progressSubject.next(event.body.secure_url);
            progressSubject.complete();
          } else {
            progressSubject.error('Respuesta inválida de Cloudinary');
          }
        }
      },
      error: (err) => {
        console.error('Error al subir a Cloudinary:', err);
        progressSubject.error(err);
      },
    });

    return progressSubject.asObservable();
  }
}
