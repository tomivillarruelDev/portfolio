import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/portfolio/interfaces/project.interface';
import { FirebaseService } from 'src/app/portfolio/services/firebase.service';

@Component({
  selector: 'portfolio-projects-image-card',
  templateUrl: './project-image-card.component.html',
  styleUrls: ['./project-image-card.component.css']
})
export class ProjectImageCardComponent implements OnInit {

  public projects: Project[] = [];

  constructor( private firebaseService: FirebaseService ) { }

  async ngOnInit(): Promise<void> {
    this.projects = await this.getProjects();
  }

  public getImageProject( projectName: string ): string {
    let nameWithoutSpaces = projectName.replace(/\s/g, '');
    let nameWithoutAccents = nameWithoutSpaces.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `./assets/projects/${nameWithoutAccents.toLowerCase()}.png`;
  }

  private async getProjects(): Promise<Project[]> {
    const resp = await this.firebaseService.getProjects('projects-image');
    return resp;
  }
}
