import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ProjectService,
  Project,
  ProjectType,
} from '../../services/project.service';
import { TechnologyService } from '../../services/technology.service';
import { Technology } from 'src/app/shared/interfaces/technology.interface';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.css'],
    standalone: false
})
export class ProjectListComponent implements OnInit {
  imageProjects: Project[] = [];
  cardProjects: Project[] = [];
  allTechnologies: Technology[] = [];
  loading: { [key: string]: boolean } = {
    image: true,
    card: true,
  };
  error: { [key: string]: string } = {
    image: '',
    card: '',
  };
  activeTab: 'image' | 'card' = 'image';

  // Enum para usar en la plantilla
  projectTypes = ProjectType;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private technologyService: TechnologyService
  ) {}

  ngOnInit(): void {
    this.loadAllTechnologies();
    this.loadAllProjects();
  }

  async loadAllProjects(): Promise<void> {
    this.loadImageProjects();
    this.loadCardProjects();
  }

  async loadImageProjects(): Promise<void> {
    try {
      this.loading['image'] = true;
      this.imageProjects = await this.projectService.getProjects(
        ProjectType.IMAGE
      );
    } catch (error) {
      console.error('Error al cargar proyectos con imagen:', error);
      this.error['image'] =
        'Error al cargar los proyectos con imagen. Intente nuevamente.';
    } finally {
      this.loading['image'] = false;
    }
  }

  async loadCardProjects(): Promise<void> {
    try {
      this.loading['card'] = true;
      this.cardProjects = await this.projectService.getProjects(
        ProjectType.CARD
      );
    } catch (error) {
      console.error('Error al cargar proyectos tipo tarjeta:', error);
      this.error['card'] =
        'Error al cargar los proyectos tipo tarjeta. Intente nuevamente.';
    } finally {
      this.loading['card'] = false;
    }
  }

  async loadAllTechnologies(): Promise<void> {
    try {
      this.allTechnologies = await this.technologyService.getTechnologies();
    } catch (error) {
      console.error('Error al cargar tecnologías:', error);
      this.allTechnologies = [];
    }
  }

  getTechnologyNameById(id: string): string {
    const tech = this.allTechnologies.find((t) => t.id === id);
    return tech ? tech.name : id;
  }

  setActiveTab(tab: 'image' | 'card'): void {
    this.activeTab = tab;
  }

  editProject(id: string, type: ProjectType): void {
    this.router.navigate(['/admin/projects/edit', id], {
      queryParams: { type: type },
    });
  }

  async deleteProject(id: string, type: ProjectType): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      return;
    }

    try {
      await this.projectService.deleteProject(id, type);

      if (type === ProjectType.IMAGE) {
        this.imageProjects = this.imageProjects.filter(
          (project) => project.id !== id
        );
        // Reordenar después de eliminar
        this.reorderProjects(this.imageProjects, type);
      } else {
        this.cardProjects = this.cardProjects.filter(
          (project) => project.id !== id
        );
        // Reordenar después de eliminar
        this.reorderProjects(this.cardProjects, type);
      }
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      if (type === ProjectType.IMAGE) {
        this.error['image'] =
          'Error al eliminar el proyecto. Intente nuevamente.';
      } else {
        this.error['card'] =
          'Error al eliminar el proyecto. Intente nuevamente.';
      }
    }
  }

  createProject(type: ProjectType): void {
    this.router.navigate(['/admin/projects/create'], {
      queryParams: { type: type },
    });
  }

  // Mover un proyecto hacia arriba (orden menor)
  async moveProjectUp(index: number, type: ProjectType): Promise<void> {
    if (index <= 0) return; // Ya está en la parte superior

    const projects =
      type === ProjectType.IMAGE ? this.imageProjects : this.cardProjects;

    // Intercambiar posición con el elemento anterior
    [projects[index], projects[index - 1]] = [
      projects[index - 1],
      projects[index],
    ];

    // Guardar el nuevo orden
    await this.saveProjectsOrder(projects, type);
  }

  // Mover un proyecto hacia abajo (orden mayor)
  async moveProjectDown(index: number, type: ProjectType): Promise<void> {
    const projects =
      type === ProjectType.IMAGE ? this.imageProjects : this.cardProjects;

    if (index >= projects.length - 1) return; // Ya está en la parte inferior

    // Intercambiar posición con el elemento siguiente
    [projects[index], projects[index + 1]] = [
      projects[index + 1],
      projects[index],
    ];

    // Guardar el nuevo orden
    await this.saveProjectsOrder(projects, type);
  }

  // Guardar el orden actual de los proyectos
  private async saveProjectsOrder(
    projects: Project[],
    type: ProjectType
  ): Promise<void> {
    try {
      const projectIds = projects.map((p) => p.id!);
      await this.projectService.reorderProjects(projectIds, type);
    } catch (error) {
      console.error('Error al guardar el orden de los proyectos:', error);
      if (type === ProjectType.IMAGE) {
        this.error['image'] =
          'Error al actualizar el orden. Intente nuevamente.';
        this.loadImageProjects(); // Recargar para restaurar el orden original
      } else {
        this.error['card'] =
          'Error al actualizar el orden. Intente nuevamente.';
        this.loadCardProjects(); // Recargar para restaurar el orden original
      }
    }
  }

  private async reorderProjects(
    projects: Project[],
    type: ProjectType
  ): Promise<void> {
    // Actualizar el orden de los proyectos después de eliminar uno
    try {
      const projectIds = projects.map((p) => p.id!);
      await this.projectService.reorderProjects(projectIds, type);
    } catch (error) {
      console.error('Error al reordenar proyectos después de eliminar:', error);
    }
  }
}
