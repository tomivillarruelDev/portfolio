import { Injectable } from '@angular/core';
import { Project } from '../interfaces/project.interface';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private url: string = 'https://tomas-villarruel-portfolio-default-rtdb.firebaseio.com/';

  constructor( private http: HttpClient) { }

  async getProjects(): Promise<Project[]> {
    const resp: { [ key:string ]: Project } = await firstValueFrom( this.http.get<{ [ key: string ]: Project }>(`${this.url}/projects.json`) );
    return this.createArrayProjects( resp );
    
  }
 
  private createArrayProjects( projectObj: { [key: string ]: Project }) : Project[] {

    if( !projectObj ) { return []; }

    const projects = Object.entries( projectObj ).map( ( [key, value]) => {
      const project: Project = value;
      project.id = key;
      return project

    });

    return projects;
  }
}
