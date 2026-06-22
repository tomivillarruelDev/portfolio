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
  photoURLs?: string[] | null;
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
      console.error(`Error al obtener proyectos (${projectType}):`, error);
      throw new Error(`No se pudieron obtener los proyectos (${projectType})`);
    }
  }

  async getProjectById(id: string, projectType: ProjectType = ProjectType.IMAGE): Promise<Project | null> {
    try {
      const snapshot = await this.db.database.ref(`${projectType}/${id}`).once('value');
      const project = snapshot.val();
      return project ? { ...project, id } : null;
    } catch (error) {
      console.error(`Error al obtener proyecto por ID (${id}, ${projectType}):`, error);
      throw new Error(`No se pudo obtener el proyecto (${id}, ${projectType})`);
    }
  }

  async createProject(projectData: Omit<Project, 'id'>, projectType: ProjectType = ProjectType.IMAGE): Promise<Project> {
    try {
      const newRef = this.db.database.ref(projectType).push();
      const key = newRef.key!;
      let data = { ...projectData };
      if (data.page      === undefined) data.page      = null;
      if (data.photoURL  === undefined) data.photoURL  = null;
      if (data.photoURLs === undefined) data.photoURLs = null;
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
      console.error(`Error al crear proyecto (${projectType}):`, error);
      throw new Error(`No se pudo crear el proyecto (${projectType})`);
    }
  }

  async updateProject(project: Project, projectType: ProjectType = ProjectType.IMAGE): Promise<Project> {
    if (!project.id) throw new Error('El ID del proyecto es requerido para actualizar');
    try {
      const { id, ...projectData } = project;
      await this.db.database.ref(`${projectType}/${id}`).update(projectData);
      return project;
    } catch (error) {
      console.error(`Error al actualizar proyecto (${project.id}, ${projectType}):`, error);
      throw new Error(`No se pudo actualizar el proyecto (${project.id}, ${projectType})`);
    }
  }

  async deleteProject(id: string, projectType: ProjectType = ProjectType.IMAGE): Promise<void> {
    try {
      if (projectType === ProjectType.IMAGE) {
        const project = await this.getProjectById(id, projectType);
        if (project) {
          if (project.photoURL) {
            this.deleteImage(project.photoURL).catch(err =>
              console.warn(`Failed to delete main image for project ${id}:`, err)
            );
          }
          if (Array.isArray(project.photoURLs)) {
            project.photoURLs.forEach(url => {
              if (url) {
                this.deleteImage(url).catch(err =>
                  console.warn(`Failed to delete secondary image for project ${id}:`, err)
                );
              }
            });
          }
        }
      }
      await this.db.database.ref(`${projectType}/${id}`).remove();
    } catch (error) {
      console.error(`Error al eliminar proyecto (${id}, ${projectType}):`, error);
      throw new Error(`No se pudo eliminar el proyecto (${id}, ${projectType})`);
    }
  }

  async updateProjectOrder(projectId: string, newOrder: number, projectType: ProjectType = ProjectType.IMAGE): Promise<void> {
    try {
      await this.db.database.ref(`${projectType}/${projectId}`).update({ order: newOrder });
    } catch (error) {
      console.error(`Error al actualizar el orden del proyecto (${projectId}, ${projectType}):`, error);
      throw new Error(`No se pudo actualizar el orden del proyecto (${projectId}, ${projectType})`);
    }
  }

  async reorderProjects(projectIds: string[], projectType: ProjectType = ProjectType.IMAGE): Promise<void> {
    if (!projectIds?.length) return;
    try {
      const batchUpdate: { [key: string]: number } = {};
      projectIds.forEach((id, index) => { batchUpdate[`/${projectType}/${id}/order`] = index; });
      await this.db.database.ref().update(batchUpdate);
    } catch (error) {
      console.error(`Error al reordenar proyectos (${projectType}):`, error);
      throw new Error(`No se pudo reordenar los proyectos (${projectType})`);
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
          console.error('Error al eliminar la imagen del storage:', error);
        }
      }
    }
  }
}
