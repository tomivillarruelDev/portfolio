import { Injectable } from '@angular/core';
import { Project } from '../interfaces/project.interface';
import { firstValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  private url: string ='https://tomas-villarruel-portfolio-default-rtdb.firebaseio.com/';

  public projects: Project[] = [];

  constructor(private http: HttpClient) {}



  get technologiesProjects(): string[] {
    return this.projects
      .map((project) => project.technologies)
      .reduce((acc, val) => acc.concat(val), [])
      .map((tech) => tech.toLowerCase());
  }

  async getProjects( projectType: string): Promise<Project[]> {
    const resp: { [key: string]: Project } = await firstValueFrom(
      this.http.get<{ [key: string]: Project }>(`${this.url}/${ projectType }.json`)
    );
    this.projects = this.createArrayProjects(resp);
    return this.projects;
  }

  private createArrayProjects(projectObj: {
    [key: string]: Project;
  }): Project[] {
    if (!projectObj) {
      return [];
    }

    const projects = Object.entries(projectObj).map(([key, value]) => {
      const project: Project = value;
      project.id = key;
      return project;
    });

    return projects;
  }
}
