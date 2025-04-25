import { inject, Injectable } from '@angular/core';
import {
  Database,
  ref,
  get,
  set,
  update,
  remove,
  push,
  child,
  query,
  orderByChild,
} from '@angular/fire/database';
import {
  Storage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

import { Project } from './project.service';
import { Technology } from 'src/app/shared/interfaces/technology.interface';

@Injectable({
  providedIn: 'root',
})
export class  TechnologyService {
  private readonly defaultTechnologies: string[] = [
    'javascript',
    'typescript',
    'angular',
    'react',
    'vue',
    'nodejs',
    'mongodb',
    'firebase',
    'html',
    'css',
    'sass',
    'tailwind',
    'python',
    'django',
    'flask',
    'mysql',
    'postgresql',
  ];

  // Inyección moderna con inject()
  private db = inject(Database);
  private storage = inject(Storage);

  /**
   * Obtiene todas las tecnologías ordenadas por el campo 'order'.
   */
  async getTechnologies(): Promise<Technology[]> {
    try {
      const dbRef = ref(this.db, 'technologies');
      const snapshot = await get(dbRef);
      const techs: Technology[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        techs.push({ id: child.key, ...val });
      });
      techs.sort((a, b) => (a.order || 0) - (b.order || 0));
      if (techs.length === 0) {
        await this.initDefaultTechnologies();
        return this.getTechnologies();
      }
      return techs;
    } catch (error) {
      console.error('Error al obtener tecnologías:', error);
      return [];
    }
  }

  /**
   * Obtiene una tecnología por su ID.
   */
  async getTechnologyById(id: string): Promise<Technology | undefined> {
    try {
      const dbRef = ref(this.db, `technologies/${id}`);
      const snapshot = await get(dbRef);
      const val = snapshot.val();
      return val ? { id, ...val } : undefined;
    } catch (error) {
      console.error(`Error al obtener tecnología con ID ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Crea una nueva tecnología si no existe una con el mismo nombre (case-insensitive).
   * Siempre asegura el campo icon y el campo order.
   */
  async createTechnology(technology: Technology): Promise<string | null> {
    try {
      const techs = await this.getTechnologies();
      const exists = techs.some(
        (t) =>
          t.name.trim().toLowerCase() === technology.name.trim().toLowerCase()
      );
      if (exists) return null;
      const maxOrder =
        techs.length > 0 ? Math.max(...techs.map((t) => t.order || 0)) : 0;
      const techWithOrder = {
        ...technology,
        order: maxOrder + 1,
        icon: technology.icon ?? '',
      };
      const dbRef = ref(this.db, 'technologies');
      const newRef = push(dbRef);
      await set(newRef, techWithOrder);
      return newRef.key!;
    } catch (error) {
      console.error('Error al crear tecnología:', error);
      throw new Error('No se pudo crear la tecnología');
    }
  }

  /**
   * Actualiza una tecnología existente por ID.
   */
  async updateTechnology(technology: Partial<Technology>): Promise<void> {
    if (!technology.id)
      throw new Error('No se proporcionó un ID para actualizar la tecnología');
    try {
      const { id, ...data } = technology;
      const dbRef = ref(this.db, `technologies/${id}`);
      await update(dbRef, data);
    } catch (error) {
      console.error('Error al actualizar tecnología:', error);
      throw new Error('No se pudo actualizar la tecnología');
    }
  }

  /**
   * Elimina una tecnología y su icono asociado si corresponde.
   */
  async deleteTechnology(id: string): Promise<void> {
    try {
      const tech = await this.getTechnologyById(id);
      if (tech?.icon && tech.icon.includes('firebase')) {
        await this.deleteIconFile(tech.icon);
      }
      const dbRef = ref(this.db, `technologies/${id}`);
      await remove(dbRef);
      await this.reorderTechnologies();
    } catch (error) {
      console.error('Error al eliminar tecnología:', error);
      throw new Error('No se pudo eliminar la tecnología');
    }
  }

  /**
   * Importa tecnologías desde los proyectos, evitando duplicados.
   */
  async importTechnologiesFromProjects(
    collectionName: string
  ): Promise<number> {
    try {
      const dbRef = ref(this.db, collectionName);
      const snapshot = await get(dbRef);
      if (!snapshot.exists()) return 0;
      const existingTechs = (await this.getTechnologies()).map((t) =>
        t.name.toLowerCase()
      );
      const techsToAdd: string[] = [];
      snapshot.forEach((child) => {
        const data = child.val() as Project;
        if (Array.isArray(data.technologies)) {
          data.technologies.forEach((tech: string) => {
            const techLower = tech.toLowerCase();
            if (
              techLower &&
              !existingTechs.includes(techLower) &&
              !techsToAdd.includes(techLower)
            ) {
              techsToAdd.push(techLower);
            }
          });
        }
      });
      let created = 0;
      for (const techName of techsToAdd) {
        const result = await this.createTechnology({
          name: techName,
          icon: '',
          order: 0,
        });
        if (result) created++;
      }
      return created;
    } catch (error) {
      console.error('Error al importar tecnologías desde proyectos:', error);
      return 0;
    }
  }

  /**
   * Inicializa las tecnologías predeterminadas si la base está vacía.
   */
  public async initDefaultTechnologies(): Promise<void> {
    try {
      const updates: any = {};
      this.defaultTechnologies.forEach((techName, index) => {
        const newKey = push(ref(this.db, 'technologies')).key;
        updates[`technologies/${newKey}`] = {
          name: techName,
          order: index + 1,
        };
      });
      const dbRef = ref(this.db, '/');
      await update(dbRef, updates);
    } catch (error) {
      console.error('Error al inicializar tecnologías predeterminadas:', error);
    }
  }

  /**
   * Elimina el archivo de icono del storage si existe.
   */
  private async deleteIconFile(iconUrl: string): Promise<void> {
    try {
      const iconPath = iconUrl.split('/').pop();
      if (iconPath) {
        const fileRef = storageRef(
          this.storage,
          `technology-icons/${iconPath}`
        );
        await deleteObject(fileRef);
      }
    } catch (error) {
      console.error('Error al eliminar el icono:', error);
    }
  }

  /**
   * Reordena las tecnologías después de eliminar alguna.
   */
  private async reorderTechnologies(): Promise<void> {
    const techs = await this.getTechnologies();
    const updates: any = {};
    techs.forEach((tech, index) => {
      if (tech.id) updates[`technologies/${tech.id}/order`] = index + 1;
    });
    const dbRef = ref(this.db, '/');
    await update(dbRef, updates);
  }

  /**
   * Sube un ícono a storage y devuelve la URL pública.
   */
  async uploadIcon(file: File, technologyName: string): Promise<string> {
    try {
      const fileName = `${technologyName
        .toLowerCase()
        .replace(/\s+/g, '-')}-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `technology-icons/${fileName}`;
      const fileRef = storageRef(this.storage, filePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      console.error('Error al subir el ícono:', error);
      throw new Error('No se pudo subir el ícono');
    }
  }
}
