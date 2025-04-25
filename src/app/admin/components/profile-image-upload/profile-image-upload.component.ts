import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileImageService } from '../../../shared/services/profile-image.service';

@Component({
    selector: 'app-profile-image-upload',
    templateUrl: './profile-image-upload.component.html',
    styleUrls: ['./profile-image-upload.component.css'],
    standalone: false
})
export class ProfileImageUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  currentImageUrl: string | null = null;
  uploadSuccessful: boolean = false;
  errorMessage: string | null = null;
  lastUpdateDate: Date | null = null;
  previewUrl: string | null = null;
  imageLoaded: boolean = false;

  constructor(
    private router: Router,
    private profileImageService: ProfileImageService
  ) {}

  ngOnInit(): void {
    // Inicialmente la imagen no está cargada
    this.imageLoaded = false;
    this.getCurrentImageUrl();
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      this.selectedFile = inputElement.files[0];

      // Validar que sea una imagen
      if (!this.selectedFile.type.startsWith('image/')) {
        this.errorMessage =
          'Por favor selecciona un archivo de imagen válido (JPEG, PNG, etc.)';
        this.selectedFile = null;
        this.previewUrl = null;
        return;
      }

      // Crear URL para la vista previa
      this.createImagePreview();

      this.errorMessage = null;
    }
  }

  // Método para crear la URL de vista previa de la imagen
  createImagePreview(): void {
    if (!this.selectedFile) {
      this.previewUrl = null;
      return;
    }

    this.previewUrl = window.URL.createObjectURL(this.selectedFile);
  }

  // Limpiar la URL de vista previa al destruir el componente para evitar pérdidas de memoria
  ngOnDestroy(): void {
    if (this.previewUrl) {
      window.URL.revokeObjectURL(this.previewUrl);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor selecciona una imagen para subir';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;
    this.uploadProgress = 0;

    this.profileImageService.uploadProfileImage(this.selectedFile).subscribe({
      next: (progress) => {
        if (typeof progress === 'number') {
          this.uploadProgress = progress;
        }
      },
      error: (error) => {
        console.error('Error al subir la imagen:', error);
        this.errorMessage =
          'Error al subir la imagen. Por favor intenta nuevamente.';
        this.isUploading = false;
      },
      complete: () => {
        // Subida completada exitosamente
        this.isUploading = false;
        this.uploadSuccessful = true;
        this.selectedFile = null;
        this.lastUpdateDate = new Date();

        // Actualizar la URL de la imagen
        this.profileImageService.loadImageUrl().subscribe((url) => {
          this.currentImageUrl = url;
        });

        setTimeout(() => {
          this.uploadSuccessful = false;
        }, 5000);
      },
    });
  }

  getCurrentImageUrl(): void {
    this.profileImageService.loadImageUrl().subscribe((url) => {
      this.currentImageUrl = url;
      // Resetear el estado de carga cuando cambia la URL
      this.imageLoaded = false;
      // La fecha de actualización sería ideal obtenerla de los metadatos,
      // pero para simplificar usaremos la fecha actual si tenemos una URL válida
      if (url && !url.includes('assets')) {
        this.lastUpdateDate = new Date();
      }
    });
  }

  onImageLoad(): void {
    // Marcar la imagen como cargada
    this.imageLoaded = true;
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
