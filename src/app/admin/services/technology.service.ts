import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { Project } from './project.service';
import { Technology } from 'src/app/shared/interfaces/technology.interface';

@Injectable({
  providedIn: 'root',
})
export class TechnologyService {
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

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage
  ) {}

  /**
   * Obtiene todas las tecnologías ordenadas por el campo 'order'.
   */
  async getTechnologies(): Promise<Technology[]> {
    try {
      const snapshot = await this.db
        .list<Technology>('technologies')
        .query.once('value');
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
      const snapshot = await this.db
        .object<Technology>(`technologies/${id}`)
        .query.once('value');
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
      const ref = await this.db.list('technologies').push(techWithOrder);
      return ref.key!;
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
      await this.db.object(`technologies/${id}`).update(data);
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
      await this.db.object(`technologies/${id}`).remove();
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
      const snapshot = await this.db
        .list<Project>(collectionName)
        .query.once('value');
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
        const newKey = this.db.createPushId();
        updates[`technologies/${newKey}`] = {
          name: techName,
          order: index + 1,
        };
      });
      await this.db.object('/').update(updates);
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
        await this.storage
          .ref(`technology-icons/${iconPath}`)
          .delete()
          .toPromise();
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
    await this.db.object('/').update(updates);
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
      const task = await this.storage.upload(filePath, file);
      const url = await this.storage.ref(filePath).getDownloadURL().toPromise();
      return url;
    } catch (error) {
      console.error('Error al subir el ícono:', error);
      throw new Error('No se pudo subir el ícono');
    }
  }
}
