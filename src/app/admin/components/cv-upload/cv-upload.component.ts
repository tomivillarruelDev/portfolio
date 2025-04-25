import { Component, OnInit, NgZone } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';
import { Router } from '@angular/router';
import { CvService } from '../../../shared/services/cv.service';
import { CommonModule } from '@angular/common';
import { Observable, from, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css'],
  imports: [CommonModule],
})
export class CvUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  currentCvUrl: string | null = null;
  uploadSuccessful: boolean = false;
  errorMessage: string | null = null;
  lastUpdateDate: Date | null = null;

  constructor(
    private storage: Storage,
    private router: Router,
    private cvService: CvService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.getCurrentCvUrl();
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      this.selectedFile = inputElement.files[0];

      // Validar que sea un archivo PDF
      if (this.selectedFile.type !== 'application/pdf') {
        this.errorMessage = 'Por favor selecciona un archivo PDF';
        this.selectedFile = null;
        return;
      }

      this.errorMessage = null;
    }
  }

  uploadCV(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor selecciona un archivo PDF para subir';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;
    this.uploadProgress = 0;

    // Ejecutar la subida fuera de la zona de Angular para evitar problemas de detección de cambios
    this.ngZone.runOutsideAngular(() => {
      // Crear una referencia única para evitar sobrescrituras
      const fileName = 'tomasvillarruelCV.pdf';
      const storageRef = ref(this.storage, `cv/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, this.selectedFile!);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Actualizar progreso dentro de la zona para actualizar la UI
          this.ngZone.run(() => {
            this.uploadProgress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          });
        },
        (error) => {
          // Manejar error dentro de la zona para actualizar la UI
          this.ngZone.run(() => {
            console.error('Error al subir el archivo:', error);
            this.errorMessage =
              'Error al subir el archivo. Por favor intenta nuevamente.';
            this.isUploading = false;
          });
        },
        () => {
          // Completado exitosamente
          // Usar from para convertir la promesa en observable y ejecutarlo fuera de la zona
          from(getDownloadURL(uploadTask.snapshot.ref)).subscribe(
            (downloadURL) => {
              // Volver a la zona para actualizar la UI
              this.ngZone.run(() => {
                this.currentCvUrl = downloadURL;
                this.isUploading = false;
                this.uploadSuccessful = true;
                this.selectedFile = null;
                // Actualizar la fecha de última modificación
                this.lastUpdateDate = new Date();

                // Refrescar la URL del CV en el servicio
                this.cvService.refreshCvUrl();

                setTimeout(() => {
                  this.uploadSuccessful = false;
                }, 5000);
              });
            }
          );
        }
      );
    });
  }

  getCurrentCvUrl(): void {
    // Usar el servicio para obtener la URL
    this.cvService.loadCvUrl().subscribe((url) => {
      this.currentCvUrl = url;

      // Obtener los metadatos del archivo para saber su fecha de última modificación
      if (url && !url.includes('assets')) {
        // Solo si es una URL de Firebase, usamos el servicio para obtener los metadatos
        this.cvService.getMetadata().subscribe((metadata) => {
          if (metadata && metadata.updated) {
            this.lastUpdateDate = new Date(metadata.updated);
          }
        });
      }
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
