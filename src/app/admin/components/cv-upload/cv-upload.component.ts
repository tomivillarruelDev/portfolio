import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CvService } from '../../../shared/services/cv.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule],
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

    this.cvService.uploadCv(this.selectedFile).subscribe({
      next: (progress) => {
        if (typeof progress === 'number') {
          this.uploadProgress = progress;
        }
      },
      error: (error) => {
        console.error('Error al subir el CV:', error);
        this.errorMessage =
          'Error al subir el archivo. Por favor intenta nuevamente.';
        this.isUploading = false;
      },
      complete: () => {
        this.isUploading = false;
        this.uploadSuccessful = true;
        this.selectedFile = null;
        this.lastUpdateDate = new Date();

        // Refrescar la URL del CV en la interfaz
        this.cvService.loadCvUrl().subscribe((url) => {
          this.currentCvUrl = url;
        });

        setTimeout(() => {
          this.uploadSuccessful = false;
        }, 5000);
      },
    });
  }

  getCurrentCvUrl(): void {
    // Usar el servicio para obtener la URL
    this.cvService.loadCvUrl().subscribe((url) => {
      this.currentCvUrl = url;

      // Obtener los metadatos de actualización del CV desde la base de datos
      this.cvService.getMetadata().subscribe((metadata) => {
        if (metadata && metadata.updated) {
          this.lastUpdateDate = new Date(metadata.updated);
        }
      });
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
