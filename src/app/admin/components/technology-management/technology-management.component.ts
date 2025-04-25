import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { TechnologyService } from '../../services/technology.service';

@Component({
    selector: 'app-technology-management',
    templateUrl: './technology-management.component.html',
    styleUrls: ['./technology-management.component.css'],
    standalone: false
})
export class TechnologyManagementComponent implements OnInit {
  technologies: Technology[] = [];
  technologyForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  editMode: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private technologyService: TechnologyService,
    private fb: FormBuilder
  ) {
    this.technologyForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      icon: [''],
    });
  }

  ngOnInit(): void {
    this.loadTechnologies();
  }

  async loadTechnologies(): Promise<void> {
    try {
      this.loading = true;
      this.technologies = await this.technologyService.getTechnologies();
    } catch (error) {
      console.error('Error al cargar las tecnologías:', error);
      this.error =
        'Error al cargar las tecnologías. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  async saveTechnology(): Promise<void> {
    if (this.technologyForm.invalid) {
      return;
    }

    try {
      const technology: Technology = this.technologyForm.value;

      // Si se seleccionó un archivo de ícono, subirlo primero
      if (this.selectedFile) {
        technology.icon = await this.technologyService.uploadIcon(
          this.selectedFile,
          technology.name
        );
      }

      if (this.editMode && technology.id) {
        // Actualizar tecnología existente
        await this.technologyService.updateTechnology(technology);
        this.success = `Tecnología "${technology.name}" actualizada exitosamente.`;
      } else {
        // Crear nueva tecnología
        const { id, ...newTech } = technology;
        await this.technologyService.createTechnology(newTech);
        this.success = `Tecnología "${technology.name}" creada exitosamente.`;
      }

      // Limpiar el formulario y recargar la lista
      this.resetForm();
      await this.loadTechnologies();
    } catch (error) {
      console.error('Error al guardar la tecnología:', error);
      this.error =
        'Error al guardar la tecnología. Por favor, intenta nuevamente.';
    }
  }

  editTechnology(technology: Technology): void {
    this.editMode = true;
    this.technologyForm.patchValue({
      id: technology.id,
      name: technology.name,
      icon: technology.icon || '',
    });

    // Si hay ícono, mostrarlo en la vista previa
    if (technology.icon) {
      this.previewUrl = technology.icon;
    } else {
      this.previewUrl = null;
    }
  }

  async deleteTechnology(id: string): Promise<void> {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar esta tecnología? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    try {
      await this.technologyService.deleteTechnology(id);
      this.success = 'Tecnología eliminada exitosamente.';
      await this.loadTechnologies();
    } catch (error) {
      console.error('Error al eliminar la tecnología:', error);
      this.error =
        'Error al eliminar la tecnología. Por favor, intenta nuevamente.';
    }
  }

  resetForm(): void {
    this.technologyForm.reset();
    this.editMode = false;
    this.error = '';
    this.success = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.createFilePreview(this.selectedFile!);
    }
  }

  private createFilePreview(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.previewUrl = reader.result;
    };
  }

  removeIcon(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.technologyForm.patchValue({
      icon: '',
    });
  }

  async importFromProjects(): Promise<void> {
    try {
      this.loading = true;

      // Importar desde ambas colecciones de proyectos
      const countFromProjects =
        await this.technologyService.importTechnologiesFromProjects('projects');
      const countFromImageProjects =
        await this.technologyService.importTechnologiesFromProjects(
          'projects-image'
        );

      const totalImported = countFromProjects + countFromImageProjects;

      if (totalImported > 0) {
        this.success = `Se importaron ${totalImported} tecnologías desde los proyectos existentes.`;
        await this.loadTechnologies();
      } else {
        this.success = 'No se encontraron nuevas tecnologías para importar.';
      }
    } catch (error) {
      console.error('Error al importar tecnologías:', error);
      this.error =
        'Error al importar tecnologías. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  async initializeDefaultTechnologies(): Promise<void> {
    try {
      this.loading = true;

      await this.technologyService.initDefaultTechnologies();

      this.success = 'Tecnologías inicializadas correctamente.';
      await this.loadTechnologies();
    } catch (error) {
      console.error('Error al inicializar tecnologías:', error);
      this.error =
        'Error al inicializar tecnologías. Por favor, intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
