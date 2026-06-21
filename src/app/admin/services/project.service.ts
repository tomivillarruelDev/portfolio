import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { firebaseConfig } from '../../firebase.config';
import { CloudinaryService } from './cloudinary.service';

export interface ProjectMetric {
  val: string;
  lab: string;
}

export interface Project {
  id?: string;
  name: string;
  nameHtml?: string | null;
  description: string;
  tagline?: string | null;
  metrics?: ProjectMetric[] | null;
  chipVals?: string[] | null;
  technologies: string[];
  github: string;
  page?: string | null;
  photoURL?: string | null;
  order?: number;
}

export enum ProjectType {
  CARD  = 'projects',
  IMAGE = 'projects-image',
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly databaseUrl: string = firebaseConfig.databaseURL;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFireDatabase,
    private cloudinaryService: CloudinaryService
  ) {}

  async getProjects(projectType: ProjectType = ProjectType.IMAGE): Promise<Project[]> {
    try {
      const snapshot = await this.db.database.ref(projectType).once('value');
      const obj = snapshot.val() || {};
      const arr = Object.entries(obj).map(([key, value]) => ({
        ...(value as object), id: key,
      })) as Project[];
      return arr.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    } catch (error) {
      console.error(`Error fetching projects (${projectType}):`, error);
      throw new Error(`Could not fetch projects (${projectType})`);
    }
  }

  async getProjectById(id: string, projectType: ProjectType = ProjectType.IMAGE): Promise<Project | null> {
    try {
      const snapshot = await this.db.database.ref(`${projectType}/${id}`).once('value');
      const project = snapshot.val();
      return project ? { ...project, id } : null;
    } catch (error) {
      console.error(`Error fetching project by ID (${id}, ${projectType}):`, error);
      throw new Error(`Could not fetch project (${id}, ${projectType})`);
    }
  }

  async createProject(projectData: Omit<Project, 'id'>, projectType: ProjectType = ProjectType.IMAGE): Promise<Project> {
    try {
      const newRef = this.db.database.ref(projectType).push();
      const key = newRef.key!;
      let data = { ...projectData };
      if (data.page      === undefined) data.page      = null;
      if (data.photoURL  === undefined) data.photoURL  = null;
      if (data.nameHtml  === undefined) data.nameHtml  = null;
      if (data.tagline   === undefined) data.tagline   = null;
      if (data.metrics   === undefined) data.metrics   = null;
      if (data.chipVals  === undefined) data.chipVals  = null;
      if (data.order === undefined) {
        const projects = await this.getProjects(projectType);
        const maxOrder = projects.reduce((max, p) => (p.order !== undefined && p.order > max ? p.order : max), -1);
        data.order = maxOrder + 1;
      }
      if (!Array.isArray(data.technologies)) data.technologies = [];
      await newRef.set(data);
      return { ...data, id: key };
    } catch (error) {
      console.error(`Error creating project (${projectType}):`, error);
      throw new Error(`Could not create project (${projectType})`);
    }
  }

  async updateProject(project: Project, projectType: ProjectType = ProjectType.IMAGE): Promise<Project> {
    if (!project.id) throw new Error('Project ID is required for update');
    try {
      const { id, ...projectData } = project;
      await this.db.database.ref(`${projectType}/${id}`).update(projectData);
      return project;
    } catch (error) {
      console.error(`Error updating project (${project.id}, ${projectType}):`, error);
      throw new Error(`Could not update project (${project.id}, ${projectType})`);
    }
  }

  async deleteProject(id: string, projectType: ProjectType = ProjectType.IMAGE): Promise<void> {
    try {
      if (projectType === ProjectType.IMAGE) {
        const project = await this.getProjectById(id, projectType);
        if (project?.photoURL) {
          this.deleteImage(project.photoURL).catch(err =>
            console.warn(`Failed to delete image for project ${id}:`, err)
          );
        }
      }
      await this.db.database.ref(`${projectType}/${id}`).remove();
    } catch (error) {
      console.error(`Error deleting project (${id}, ${projectType}):`, error);
      throw new Error(`Could not delete project (${id}, ${projectType})`);
    }
  }

  async updateProjectOrder(projectId: string, newOrder: number, projectType: ProjectType = ProjectType.IMAGE): Promise<void> {
    try {
      await this.db.database.ref(`${projectType}/${projectId}`).update({ order: newOrder });
    } catch (error) {
      console.error(`Error updating project order (${projectId}, ${projectType}):`, error);
      throw new Error(`Could not update project order (${projectId}, ${projectType})`);
    }
  }

  async reorderProjects(projectIds: string[], projectType: ProjectType = ProjectType.IMAGE): Promise<void> {
    if (!projectIds?.length) return;
    try {
      const batchUpdate: { [key: string]: number } = {};
      projectIds.forEach((id, index) => { batchUpdate[`/${projectType}/${id}/order`] = index; });
      await this.db.database.ref().update(batchUpdate);
    } catch (error) {
      console.error(`Error reordering projects (${projectType}):`, error);
      throw new Error(`Could not reorder projects (${projectType})`);
    }
  }

  async uploadImage(file: File, projectName: string): Promise<string> {
    try {
      return await this.cloudinaryService.uploadImage(file);
    } catch (error) {
      console.error('Error al subir la imagen a Cloudinary:', error);
      throw new Error('No se pudo subir la imagen a Cloudinary');
    }
  }

  private async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = this.storage.refFromURL(imageUrl);
        await fileRef.delete().toPromise();
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          console.error('Error deleting image from storage:', error);
        }
      }
    }
  }
}
