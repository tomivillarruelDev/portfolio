import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ProjectService,
  Project,
  ProjectType,
} from '../../services/project.service';
import { TechnologyService } from '../../services/technology.service';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-form',
  standalone: true,
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: string | null = null;
  projectType: ProjectType = ProjectType.IMAGE; // Default a IMAGE
  allTechnologies: Technology[] = [];
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  saving = false;
  // Nuevo: para guardar el orden de selección
  selectedTechnologies: string[] = [];

  // Exponer enum para uso en la plantilla
  projectTypes = ProjectType;

  // Alias para mantener compatibilidad con la plantilla HTML existente
  get loading(): boolean {
    return this.isLoading;
  }
  get error(): string | null {
    return this.errorMessage;
  }
  get availableTechnologies(): Technology[] {
    return this.allTechnologies;
  }

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private technologyService: TechnologyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      // Cambiamos a FormControl para guardar array de IDs
      technologies: new FormControl([]),
      github: ['', Validators.required],
      page: [''],
      photoURL: [''], // No requerido directamente, se maneja con la subida
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;

      // Cargar las tecnologías de la base de datos
      await this.loadTechnologies();

      // Obtener el ID y tipo del proyecto de los parámetros de ruta
      this.projectId = this.route.snapshot.paramMap.get('id');

      // Obtener el tipo de proyecto de los query params
      this.route.queryParams.subscribe((params) => {
        if (params['type']) {
          this.projectType = params['type'] as ProjectType;
        }
      });

      this.isEditMode = !!this.projectId;

      // Si estamos en modo edición y tenemos un ID de proyecto, cargamos el proyecto
      if (this.isEditMode && this.projectId) {
        await this.loadProjectData(this.projectId);
      } else {
        // Inicializar el array vacío
        this.selectedTechnologies = [];
        this.projectForm.get('technologies')?.setValue([]);
      }

      // Si es un proyecto tipo tarjeta, no necesitamos el campo photoURL
      if (this.projectType === ProjectType.CARD) {
        this.projectForm.get('photoURL')?.disable();
      }
    } catch (error) {
      console.error('Error en la inicialización del componente:', error);
      this.errorMessage =
        'Error al cargar el formulario. Por favor, recargue la página.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadTechnologies(): Promise<void> {
    try {
      // Cargar tecnologías usando el servicio
      const technologies = await this.technologyService.getTechnologies();

      // Guardar id y nombre
      this.allTechnologies = technologies.map((tech) => ({
        id: tech.id!,
        name: tech.name,
      }));

      // Ordenar alfabéticamente
      this.allTechnologies.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error al cargar tecnologías:', error);
      // Si hay un error, cargar algunas tecnologías predeterminadas
      this.allTechnologies = [
        { id: 'javascript', name: 'javascript' },
        { id: 'typescript', name: 'typescript' },
        { id: 'angular', name: 'angular' },
        { id: 'react', name: 'react' },
        { id: 'vue', name: 'vue' },
        { id: 'html', name: 'html' },
        { id: 'css', name: 'css' },
      ];
    }
  }

  async loadProjectData(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    try {
      const project = await this.projectService.getProjectById(
        id,
        this.projectType
      );

      // Verificar que project no sea nulo antes de acceder a sus propiedades
      if (project) {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description,
          github: project.github,
          page: project.page || '',
          photoURL: project.photoURL || '', // Guardar la URL existente
        });

        // Nuevo: setear el array de seleccionados en el orden original
        this.selectedTechnologies = project.technologies || [];
        this.projectForm
          .get('technologies')
          ?.setValue(this.selectedTechnologies);

        // Comprobar photoURL antes de usarla
        if (project.photoURL && this.projectType === ProjectType.IMAGE) {
          this.previewUrl = project.photoURL;
        }
      } else {
        this.errorMessage = 'Proyecto no encontrado.';
        // Considerar redirigir si el proyecto no existe
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      this.errorMessage = 'Error al cargar los datos del proyecto.';
    } finally {
      this.isLoading = false;
    }
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

  /**
   * Manejar el click de cada checkbox
   * @param techId ID de la tecnología
   * @param checked Estado del checkbox
   */
  onTechnologyCheckboxChange(techId: string, checked: boolean) {
    const current = [...this.selectedTechnologies];
    if (checked) {
      if (!current.includes(techId)) {
        current.push(techId);
      }
    } else {
      const idx = current.indexOf(techId);
      if (idx > -1) {
        current.splice(idx, 1);
      }
    }
    this.selectedTechnologies = current;
    this.projectForm.get('technologies')?.setValue(current);
  }

  /**
   * Verifica si al menos una tecnología está seleccionada
   * @returns true si hay al menos una tecnología seleccionada
   */
  hasSelectedTechnologies(): boolean {
    return this.selectedTechnologies.length > 0;
  }

  isTechSelected(tech: Technology): boolean {
    return !!tech.id && this.selectedTechnologies.includes(tech.id);
  }

  onTechCheckboxChange(event: Event, tech: Technology) {
    const checked = (event.target as HTMLInputElement).checked;
    const techId = tech.id ?? '';
    this.onTechnologyCheckboxChange(techId, checked);
  }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    if (!this.hasSelectedTechnologies()) {
      // Marcar el formulario como inválido si no hay tecnologías seleccionadas
      this.projectForm.setErrors({ 'no-technologies': true });
      return;
    }

    // Validar que haya una imagen seleccionada para proyectos tipo IMAGE
    if (
      this.projectType === ProjectType.IMAGE &&
      !this.selectedFile &&
      !this.previewUrl &&
      !this.isEditMode
    ) {
      this.errorMessage =
        'La imagen es obligatoria para este tipo de proyecto.';
      return;
    }

    try {
      this.saving = true;

      const formValues = this.projectForm.value;

      // Usar el array ordenado
      const selectedTechIds: string[] = this.selectedTechnologies;

      // Crear objeto para el proyecto con valores seguros para Firebase
      const projectData: Project = {
        name: formValues.name,
        description: formValues.description,
        technologies: selectedTechIds,
        github: formValues.github,
        // Usar null en lugar de undefined para valores opcionales
        page: formValues.page || null,
        // No incluir photoURL inicialmente
      };

      // Si es un proyecto con imagen, manejar la imagen
      if (this.projectType === ProjectType.IMAGE) {
        if (this.selectedFile) {
          // Si hay nueva imagen seleccionada, subir y usar esa URL
          projectData.photoURL = await this.projectService.uploadImage(
            this.selectedFile,
            projectData.name
          );
        } else if (this.previewUrl && typeof this.previewUrl === 'string') {
          // Si hay URL previa y es un string, usarla
          projectData.photoURL = this.previewUrl;
        } else {
          // De lo contrario, establecer explícitamente a null
          projectData.photoURL = null;
        }
      } else {
        // Para proyectos tipo Card, photoURL siempre es null
        projectData.photoURL = null;
      }

      if (this.isEditMode && this.projectId) {
        // Modo edición
        await this.projectService.updateProject(
          { ...projectData, id: this.projectId },
          this.projectType
        );
      } else {
        // Modo creación
        await this.projectService.createProject(projectData, this.projectType);
      }

      // Redirigir a la lista de proyectos
      this.router.navigate(['/admin/projects']);
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      this.errorMessage = 'Error al guardar el proyecto. Intente nuevamente.';
    } finally {
      this.saving = false;
    }
  }

  cancelEdit(): void {
    this.router.navigate(['/admin/projects']);
  }
}
