import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { TechnologiesComponent } from '../../technologies/technologies.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
    selector: 'portfolio-projects-image-card',
    templateUrl: './project-image-card.component.html',
    styleUrls: ['./project-image-card.component.css'],
    standalone: true,
    imports: [CommonModule, TechnologiesComponent, NgxSkeletonLoaderModule],
})
export class ProjectImageCardComponent {
  // Señal reactiva para los proyectos
  readonly projects = signal<Project[]>([]);
  // Señal reactiva para el estado de carga de imágenes
  readonly imagesLoaded = signal<{ [key: string]: boolean }>({});

  // Inyección moderna
  private readonly firebaseService = inject(FirebaseService);

  constructor() {
    this.loadProjects();
  }

  private async loadProjects() {
    const projects = await this.firebaseService.getProjects('projects-image');
    this.projects.set(projects);
    // Inicializar el estado de carga de imágenes
    const loaded: { [key: string]: boolean } = {};
    projects.forEach(project => {
      if (project.id) loaded[project.id] = false;
    });
    this.imagesLoaded.set(loaded);
  }

  onImageLoad(projectId: string): void {
    // Marcar la imagen como cargada de forma reactiva
    this.imagesLoaded.update(state => ({ ...state, [projectId]: true }));
  }

  getImageProject(projectName: string): string {
    let nameWithoutSpaces = projectName.replace(/\s/g, '');
    let nameWithoutAccents = nameWithoutSpaces.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `./assets/projects/${nameWithoutAccents.toLowerCase()}.png`;
  }
}
