import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project, ProjectType } from '../../services/project.service';
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
  projectType: ProjectType = ProjectType.IMAGE;
  allTechnologies: Technology[] = [];
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  saving = false;
  selectedTechnologies: string[] = [];
  projectTypes = ProjectType;

  get loading(): boolean { return this.isLoading; }
  get error(): string | null { return this.errorMessage; }

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private technologyService: TechnologyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name:        ['', Validators.required],
      nameHtml:    [''],
      description: ['', Validators.required],
      tagline:     [''],
      metric1Val:  [''], metric1Lab: [''],
      metric2Val:  [''], metric2Lab: [''],
      metric3Val:  [''], metric3Lab: [''],
      chip1: [''], chip2: [''], chip3: [''], chip4: [''],
      technologies: new FormControl([]),
      github: ['', Validators.required],
      page:   [''],
      photoURL: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      await this.loadTechnologies();
      this.projectId = this.route.snapshot.paramMap.get('id');
      this.route.queryParams.subscribe(params => {
        if (params['type']) this.projectType = params['type'] as ProjectType;
      });
      this.isEditMode = !!this.projectId;
      if (this.isEditMode && this.projectId) {
        await this.loadProjectData(this.projectId);
      } else {
        this.selectedTechnologies = [];
        this.projectForm.get('technologies')?.setValue([]);
      }
      if (this.projectType === ProjectType.CARD) {
        this.projectForm.get('photoURL')?.disable();
      }
    } catch (error) {
      this.errorMessage = 'Error al cargar el formulario.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadTechnologies(): Promise<void> {
    try {
      const technologies = await this.technologyService.getTechnologies();
      this.allTechnologies = technologies.map(t => ({ id: t.id!, name: t.name }));
      this.allTechnologies.sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      this.allTechnologies = [
        { id: 'javascript', name: 'javascript' }, { id: 'typescript', name: 'typescript' },
        { id: 'angular', name: 'angular' }, { id: 'react', name: 'react' },
      ];
    }
  }

  async loadProjectData(id: string): Promise<void> {
    try {
      const project = await this.projectService.getProjectById(id, this.projectType);
      if (!project) { this.errorMessage = 'Proyecto no encontrado.'; return; }

      const m = project.metrics ?? [];
      const c = project.chipVals ?? [];
      this.projectForm.patchValue({
        name:        project.name,
        nameHtml:    project.nameHtml || '',
        description: project.description,
        tagline:     project.tagline || '',
        metric1Val:  m[0]?.val || '', metric1Lab: m[0]?.lab || '',
        metric2Val:  m[1]?.val || '', metric2Lab: m[1]?.lab || '',
        metric3Val:  m[2]?.val || '', metric3Lab: m[2]?.lab || '',
        chip1: c[0] || '', chip2: c[1] || '', chip3: c[2] || '', chip4: c[3] || '',
        github:  project.github,
        page:    project.page || '',
        photoURL: project.photoURL || '',
      });
      // Resolver IDs o nombres a nombres canonicos
      this.selectedTechnologies = (project.technologies || []).map(entry => {
        const byId   = this.allTechnologies.find((t: Technology) => t.id === entry);
        if (byId) return byId.name;
        const byName = this.allTechnologies.find((t: Technology) => t.name.toLowerCase() === entry.toLowerCase());
        if (byName) return byName.name;
        return entry;
      }).filter(name => !(name.startsWith('-') && name.length > 14));
      this.projectForm.get('technologies')?.setValue(this.selectedTechnologies);
      if (project.photoURL && this.projectType === ProjectType.IMAGE) {
        this.previewUrl = project.photoURL;
      }
    } catch {
      this.errorMessage = 'Error al cargar los datos del proyecto.';
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile!);
      reader.onload = () => { this.previewUrl = reader.result; };
    }
  }

  isTechSelected(tech: Technology): boolean {
    return this.selectedTechnologies.includes(tech.name);
  }

  onTechCheckboxChange(event: Event, tech: Technology): void {
    const checked = (event.target as HTMLInputElement).checked;
    const name = tech.name;
    const current = [...this.selectedTechnologies];
    if (checked) { if (!current.includes(name)) current.push(name); }
    else { const i = current.indexOf(name); if (i > -1) current.splice(i, 1); }
    this.selectedTechnologies = current;
    this.projectForm.get('technologies')?.setValue(current);
  }

  hasSelectedTechnologies(): boolean { return this.selectedTechnologies.length > 0; }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    if (!this.hasSelectedTechnologies()) { this.projectForm.setErrors({ 'no-technologies': true }); return; }
    if (this.projectType === ProjectType.IMAGE && !this.selectedFile && !this.previewUrl && !this.isEditMode) {
      this.errorMessage = 'La imagen es obligatoria para proyectos con imagen.'; return;
    }
    try {
      this.saving = true;
      const f = this.projectForm.value;

      const metrics = [
        { val: f.metric1Val, lab: f.metric1Lab },
        { val: f.metric2Val, lab: f.metric2Lab },
        { val: f.metric3Val, lab: f.metric3Lab },
      ].filter(m => m.val || m.lab);

      const chipVals = [f.chip1, f.chip2, f.chip3, f.chip4].filter(Boolean);

      const projectData: Project = {
        name:        f.name,
        nameHtml:    f.nameHtml || null,
        description: f.description,
        tagline:     f.tagline || null,
        metrics:     metrics.length ? metrics : null,
        chipVals:    chipVals.length ? chipVals : null,
        technologies: this.selectedTechnologies,
        github: f.github,
        page:   f.page || null,
        photoURL: null,
      };

      if (this.projectType === ProjectType.IMAGE) {
        if (this.selectedFile) {
          projectData.photoURL = await this.projectService.uploadImage(this.selectedFile, projectData.name);
        } else if (this.previewUrl && typeof this.previewUrl === 'string') {
          projectData.photoURL = this.previewUrl;
        }
      }

      if (this.isEditMode && this.projectId) {
        await this.projectService.updateProject({ ...projectData, id: this.projectId }, this.projectType);
      } else {
        await this.projectService.createProject(projectData, this.projectType);
      }
      this.router.navigate(['/admin/projects']);
    } catch {
      this.errorMessage = 'Error al guardar el proyecto. Intente nuevamente.';
    } finally {
      this.saving = false;
    }
  }

  cancelEdit(): void { this.router.navigate(['/admin/projects']); }
}
