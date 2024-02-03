import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';

@Component({
  selector: 'portfolio-card-projects',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
})
export class ProjectCardComponent implements OnInit {
  projects: Project[] = [];

  initialProjectsToShow = 4;
  projectsToShow = this.initialProjectsToShow;

  showAllProjects: boolean = false;

  buttonText = 'Ver más';

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    this.projects = await this.getProjects();
  }

  get technologiesProjects(): string[] {
    return this.firebaseService.technologiesProjects;
  }

  private async getProjects(): Promise<Project[]> {
    const resp = await this.firebaseService.getProjects('projects');
    return resp;
  }




  showProjects() {
    if (this.projectsToShow >= this.projects.length) {
      this.projectsToShow = this.initialProjectsToShow;
      this.buttonText = 'Ver más';
    } else {
      this.projectsToShow += 6;
      this.buttonText =
        this.projectsToShow >= this.projects.length ? 'Ver menos' : 'Ver más';
    }
  }
}
