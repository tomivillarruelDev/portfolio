import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/interfaces/project.interface';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit{

  projects: Project[] = [];

  initialProjectsToShow = 6;
  projectsToShow = this.initialProjectsToShow;

  showAllProjects: boolean = false;

  buttonText = 'Ver más';

  constructor( private firebaseService: FirebaseService) { }

  async ngOnInit(): Promise<void> {
    this.projects = await this.getProjects();

  }

  private async getProjects(): Promise<Project[]> {
    const resp = await this.firebaseService.getProjects();
    return resp;
  }

  showProjects(){

    if (this.projectsToShow >= this.projects.length) {
      this.projectsToShow = this.initialProjectsToShow;
      this.buttonText = 'Ver más';
    } else {
      this.projectsToShow += 6;
      this.buttonText = this.projectsToShow >= this.projects.length ? 'Ver menos' : 'Ver más';
    }
  }
}
