import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class UploadComponent {
  @Input() projectName: string = '';
  @Output() imageUrlEmitter = new EventEmitter<string>();

  selectedFile: File | null = null;
  uploading: boolean = false;
  uploadError: string = '';
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private projectService: ProjectService) {}

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.createImagePreview(this.selectedFile!);
    }
  }

  private createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  async uploadImage() {
    if (!this.selectedFile) {
      this.uploadError = 'Selecciona un archivo primero';
      return;
    }

    if (!this.projectName) {
      this.uploadError =
        'El nombre del proyecto es necesario para subir la imagen';
      return;
    }

    try {
      this.uploading = true;
      this.uploadError = '';

      // Subir imagen a Firebase Storage
      const imageUrl = await this.projectService.uploadImage(
        this.selectedFile,
        this.projectName
      );

      // Emitir la URL de la imagen subida
      this.imageUrlEmitter.emit(imageUrl);

      // Limpiar selección
      this.selectedFile = null;
      this.previewUrl = null;
    } catch (error) {
      console.error('Error al subir la imagen', error);
      this.uploadError = 'Error al subir la imagen. Intenta nuevamente.';
    } finally {
      this.uploading = false;
    }
  }
}
