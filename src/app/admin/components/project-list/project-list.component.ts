import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ProjectService,
  Project,
  ProjectType,
} from '../../services/project.service';
import { TechnologyService } from '../../services/technology.service';
import { Technology } from 'src/app/shared/interfaces/technology.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProjectListComponent implements OnInit {
  imageProjects: Project[] = [];
  cardProjects: Project[] = [];
  allTechnologies: Technology[] = [];
  loading: { [key: string]: boolean } = { image: true, card: true };
  error: { [key: string]: string } = { image: '', card: '' };
  activeTab: 'image' | 'card' = 'image';
  projectTypes = ProjectType;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private technologyService: TechnologyService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAllTechnologies();
    this.loadAllProjects();
  }

  async loadAllProjects(): Promise<void> {
    this.loadImageProjects();
    this.loadCardProjects();
  }

  async loadImageProjects(): Promise<void> {
    try {
      this.loading['image'] = true;
      this.imageProjects = await this.projectService.getProjects(ProjectType.IMAGE);
    } catch (error) {
      console.error('Error al cargar proyectos con imagen:', error);
      this.error['image'] = 'Error al cargar los proyectos con imagen. Intente nuevamente.';
    } finally {
      this.loading['image'] = false;
    }
  }

  async loadCardProjects(): Promise<void> {
    try {
      this.loading['card'] = true;
      this.cardProjects = await this.projectService.getProjects(ProjectType.CARD);
    } catch (error) {
      console.error('Error al cargar proyectos tipo tarjeta:', error);
      this.error['card'] = 'Error al cargar los proyectos tipo tarjeta. Intente nuevamente.';
    } finally {
      this.loading['card'] = false;
    }
  }

  async loadAllTechnologies(): Promise<void> {
    try {
      this.allTechnologies = await this.technologyService.getTechnologies();
    } catch (error) {
      console.error('Error al cargar tecnologias:', error);
      this.allTechnologies = [];
    }
  }

  getTechnologyNameById(id: string): string {
    const tech = this.allTechnologies.find(
      (t) => t.id === id || t.name.toLowerCase() === id.toLowerCase()
    );
    if (tech) return tech.name;
    // Filtrar IDs huerfanos de Firebase (ej: -OOdo3a0eGl6dX_QbhkG)
    if (id.startsWith('-') && id.length > 14) return '';
    return id;
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
    if (!confirm('Estas seguro de que deseas eliminar este proyecto?')) {
      return;
    }
    try {
      await this.projectService.deleteProject(id, type);
      if (type === ProjectType.IMAGE) {
        this.imageProjects = this.imageProjects.filter((p) => p.id !== id);
        this.reorderProjects(this.imageProjects, type);
      } else {
        this.cardProjects = this.cardProjects.filter((p) => p.id !== id);
        this.reorderProjects(this.cardProjects, type);
      }
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      if (type === ProjectType.IMAGE) {
        this.error['image'] = 'Error al eliminar el proyecto. Intente nuevamente.';
      } else {
        this.error['card'] = 'Error al eliminar el proyecto. Intente nuevamente.';
      }
    }
  }

  createProject(type: ProjectType): void {
    this.router.navigate(['/admin/projects/create'], {
      queryParams: { type: type },
    });
  }

  async moveProjectUp(index: number, type: ProjectType): Promise<void> {
    if (index <= 0) return;
    const projects = type === ProjectType.IMAGE ? this.imageProjects : this.cardProjects;
    [projects[index], projects[index - 1]] = [projects[index - 1], projects[index]];
    await this.saveProjectsOrder(projects, type);
  }

  async moveProjectDown(index: number, type: ProjectType): Promise<void> {
    const projects = type === ProjectType.IMAGE ? this.imageProjects : this.cardProjects;
    if (index >= projects.length - 1) return;
    [projects[index], projects[index + 1]] = [projects[index + 1], projects[index]];
    await this.saveProjectsOrder(projects, type);
  }

  private async saveProjectsOrder(projects: Project[], type: ProjectType): Promise<void> {
    try {
      const projectIds = projects.map((p) => p.id!);
      await this.projectService.reorderProjects(projectIds, type);
    } catch (error) {
      console.error('Error al guardar el orden de los proyectos:', error);
      if (type === ProjectType.IMAGE) {
        this.error['image'] = 'Error al actualizar el orden. Intente nuevamente.';
        this.loadImageProjects();
      } else {
        this.error['card'] = 'Error al actualizar el orden. Intente nuevamente.';
        this.loadCardProjects();
      }
    }
  }

  async toggleVisibility(project: Project, type: ProjectType): Promise<void> {
    const originalValue = project.isVisible;
    const newValue = project.isVisible === false ? true : false;
    
    // Update local state first (Optimistic UI)
    project.isVisible = newValue;

    try {
      await this.projectService.updateProject({
        ...project,
        isVisible: newValue
      }, type);
    } catch (error) {
      console.error('Error al actualizar visibilidad del proyecto:', error);
      project.isVisible = originalValue; // Rollback if error
      alert('Error al cambiar la visibilidad del proyecto. Intente nuevamente.');
    }
  }

  private async reorderProjects(projects: Project[], type: ProjectType): Promise<void> {
    try {
      const projectIds = projects.map((p) => p.id!);
      await this.projectService.reorderProjects(projectIds, type);
    } catch (error) {
      console.error('Error al reordenar proyectos despues de eliminar:', error);
    }
  }
}
