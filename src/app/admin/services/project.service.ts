import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { firebaseConfig } from '../../firebase.config';

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  github: string;
  page?: string | null; // Permitir null
  photoURL?: string | null; // Permitir null
  order?: number;
}

export enum ProjectType {
  CARD = 'projects',
  IMAGE = 'projects-image',
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly databaseUrl: string = firebaseConfig.databaseURL;

  constructor(
    private storage: AngularFireStorage,
    private db: AngularFireDatabase
  ) {}

  /**
   * Obtiene todos los proyectos de un tipo específico, ordenados.
   */
  async getProjects(
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<Project[]> {
    try {
      // Usamos promise-based API en lugar de observables
      const snapshot = await this.db.database.ref(projectType).once('value');
      const projectsObject = snapshot.val() || {};

      // Convertir objeto a array
      const projectsArray = Object.entries(projectsObject).map(
        ([key, value]) => ({
          ...(value as object),
          id: key,
        })
      ) as Project[];

      // Ordenar por el campo order
      return projectsArray.sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA - orderB;
      });
    } catch (error) {
      console.error(`Error fetching projects (${projectType}):`, error);
      throw new Error(`Could not fetch projects (${projectType})`);
    }
  }

  /**
   * Obtiene un proyecto por su ID.
   */
  async getProjectById(
    id: string,
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<Project | null> {
    try {
      const snapshot = await this.db.database
        .ref(`${projectType}/${id}`)
        .once('value');
      const project = snapshot.val();
      return project ? { ...project, id } : null;
    } catch (error) {
      console.error(
        `Error fetching project by ID (${id}, ${projectType}):`,
        error
      );
      throw new Error(`Could not fetch project (${id}, ${projectType})`);
    }
  }

  /**
   * Crea un nuevo proyecto, asignando un orden si no se proporciona.
   * Reemplaza cualquier valor undefined con null para evitar problemas con Firebase.
   */
  async createProject(
    projectData: Omit<Project, 'id'>,
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<Project> {
    try {
      // Crear una nueva referencia con ID único
      const newRef = this.db.database.ref(projectType).push();
      const key = newRef.key!;

      // Clonar los datos para no modificar el objeto original
      let sanitizedData = { ...projectData };

      // Reemplazar cualquier valor undefined con null o valor por defecto
      if (sanitizedData.page === undefined) sanitizedData.page = null;
      if (sanitizedData.photoURL === undefined) sanitizedData.photoURL = null;
      if (sanitizedData.order === undefined) {
        // Obtener el siguiente orden
        const projects = await this.getProjects(projectType);
        const maxOrder = projects.reduce(
          (max, p) => (p.order !== undefined && p.order > max ? p.order : max),
          -1
        );
        sanitizedData.order = maxOrder + 1;
      }

      // Asegurar que technologies sea un array
      if (!Array.isArray(sanitizedData.technologies)) {
        sanitizedData.technologies = [];
      }

      // Guardar en Firebase
      await newRef.set(sanitizedData);
      return { ...sanitizedData, id: key };
    } catch (error) {
      console.error(`Error creating project (${projectType}):`, error);
      throw new Error(`Could not create project (${projectType})`);
    }
  }

  /**
   * Actualiza un proyecto existente.
   */
  async updateProject(
    project: Project,
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<Project> {
    if (!project.id) {
      throw new Error('Project ID is required for update');
    }
    try {
      const { id, ...projectData } = project;
      await this.db.database.ref(`${projectType}/${id}`).update(projectData);
      return project;
    } catch (error) {
      console.error(
        `Error updating project (${project.id}, ${projectType}):`,
        error
      );
      throw new Error(
        `Could not update project (${project.id}, ${projectType})`
      );
    }
  }

  /**
   * Elimina un proyecto y su imagen asociada si es de tipo IMAGE.
   */
  async deleteProject(
    id: string,
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<void> {
    try {
      if (projectType === ProjectType.IMAGE) {
        const project = await this.getProjectById(id, projectType);
        if (project?.photoURL) {
          this.deleteImage(project.photoURL).catch((err) =>
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

  /**
   * Actualiza el orden de un proyecto específico.
   */
  async updateProjectOrder(
    projectId: string,
    newOrder: number,
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<void> {
    try {
      await this.db.database
        .ref(`${projectType}/${projectId}`)
        .update({ order: newOrder });
    } catch (error) {
      console.error(
        `Error updating project order (${projectId}, ${projectType}):`,
        error
      );
      throw new Error(
        `Could not update project order (${projectId}, ${projectType})`
      );
    }
  }

  /**
   * Reordena múltiples proyectos eficientemente usando una actualización por lotes.
   */
  async reorderProjects(
    projectIds: string[],
    projectType: ProjectType = ProjectType.IMAGE
  ): Promise<void> {
    if (!projectIds || projectIds.length === 0) {
      return;
    }
    try {
      const batchUpdate: { [key: string]: number } = {};
      projectIds.forEach((id, index) => {
        batchUpdate[`/${projectType}/${id}/order`] = index;
      });
      await this.db.database.ref().update(batchUpdate);
    } catch (error) {
      console.error(`Error reordering projects (${projectType}):`, error);
      throw new Error(`Could not reorder projects (${projectType})`);
    }
  }

  /**
   * Sube una imagen al storage de Firebase y retorna la URL de descarga.
   * Incluye mecanismo de reintentos para evitar errores 404 justo después de la subida.
   */
  async uploadImage(file: File, projectName: string): Promise<string> {
    const safeFileName = `${projectName
      .toLowerCase()
      .replace(/\s+/g, '-')}-${Date.now()}`;
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${safeFileName}.${fileExtension}`; // Añadir extensión al archivo
    const filePath = `project-images/${fileName}`;
    const fileRef = this.storage.ref(filePath);

    try {
      // Subir la imagen y esperar a que se complete
      await this.storage.upload(filePath, file).task;

      // Implementar mecanismo de reintento para obtener la URL
      let downloadURL = '';
      let attempts = 0;
      const maxAttempts = 5;
      const retryDelay = 700; // milisegundos

      while (attempts < maxAttempts) {
        try {
          // Pequeña pausa antes de solicitar la URL
          await new Promise((r) => setTimeout(r, retryDelay));
          downloadURL = await this.storage
            .ref(filePath)
            .getDownloadURL()
            .toPromise();

          if (downloadURL) {
            console.log(
              `Image upload successful after ${attempts + 1} attempt(s)`
            );
            return downloadURL;
          }

          attempts++;
        } catch (error) {
          console.log(
            `Retry attempt ${attempts + 1}/${maxAttempts} failed:`,
            error
          );
          attempts++;

          // Si es el último intento, propagar el error
          if (attempts >= maxAttempts) {
            throw error;
          }
        }
      }

      throw new Error(
        `Failed to get download URL after ${maxAttempts} attempts`
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Could not upload image to Firebase Storage');
    }
  }

  /**
   * Elimina una imagen del storage de Firebase usando su URL.
   */
  private async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
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
