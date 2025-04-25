import { Component, OnInit } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} from '@angular/fire/storage';
import { Router } from '@angular/router';
import { CvService } from '../../../shared/services/cv.service';

@Component({
  selector: 'app-cv-upload',
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css'],
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
    private cvService: CvService
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

    // Crear una referencia única con timestamp para evitar sobrescrituras
    const fileName = 'tomasvillarruelCV.pdf';
    const storageRef = ref(this.storage, `cv/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Actualizar progreso
        this.uploadProgress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // Manejar error
        console.error('Error al subir el archivo:', error);
        this.errorMessage =
          'Error al subir el archivo. Por favor intenta nuevamente.';
        this.isUploading = false;
      },
      () => {
        // Completado exitosamente
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
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

  getCurrentCvUrl(): void {
    // Usar el servicio para obtener la URL
    this.cvService.loadCvUrl().subscribe((url) => {
      this.currentCvUrl = url;

      // Obtener los metadatos del archivo para saber su fecha de última modificación
      if (url && !url.includes('assets')) {
        // Solo si es una URL de Firebase
        const cvRef = ref(this.storage, 'cv/tomasvillarruelCV.pdf');
        getMetadata(cvRef)
          .then((metadata) => {
            if (metadata && metadata.updated) {
              this.lastUpdateDate = new Date(metadata.updated);
            }
          })
          .catch((error) => {
            console.log('Error al obtener los metadatos del CV', error);
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
