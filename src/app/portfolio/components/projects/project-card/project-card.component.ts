import { Component, signal, inject } from '@angular/core';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';
import { CommonModule } from '@angular/common';
import { getTechClass, getTechAbbr } from 'src/app/portfolio/constants/tech-map.constant';

@Component({
    selector: 'portfolio-card-projects',
    templateUrl: './project-card.component.html',
    styleUrls: ['./project-card.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ProjectCardComponent {
  // Señales reactivas para los proyectos y el estado de la UI
  readonly projects = signal<Project[]>([]);
  readonly initialProjectsToShow = 4;
  readonly projectsToShow = signal(this.initialProjectsToShow);
  readonly buttonText = signal('Ver más');

  // Inyección moderna
  private readonly firebaseService = inject(FirebaseService);

  constructor() {
    this.loadProjects();
  }

  private async loadProjects() {
    const resp = await this.firebaseService.getProjects('projects');
    this.projects.set(resp);
  }

  getTechIcon(techName: string): string | null {
    if (!techName) return null;
    return this.firebaseService.techIconCache()[techName.trim().toLowerCase()] || null;
  }

  getTechClass(tech: string): string { return getTechClass(tech); }
  getTechAbbr(tech: string): string { return getTechAbbr(tech); }

  showProjects() {
    const total = this.projects().length;
    if (this.projectsToShow() >= total) {
      this.projectsToShow.set(this.initialProjectsToShow);
      this.buttonText.set('Ver más');
    } else {
      const newCount = this.projectsToShow() + 6;
      this.projectsToShow.set(newCount);
      this.buttonText.set(newCount >= total ? 'Ver menos' : 'Ver más');
    }
  }
}
