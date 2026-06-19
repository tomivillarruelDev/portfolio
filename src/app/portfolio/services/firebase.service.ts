import { Injectable } from '@angular/core';
import { Project } from '../interfaces/project.interface';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private url = 'https://tomas-villarruel-portfolio-default-rtdb.firebaseio.com';

  public projects: Project[] = [];

  // Cache de tecnologías ID → nombre
  private techCache: Record<string, string> | null = null;

  constructor(private http: HttpClient) {}

  // ── Resuelve el mapa de tecnologías (ID → name) ──────────────────────────
  private async getTechMap(): Promise<Record<string, string>> {
    if (this.techCache) return this.techCache;
    try {
      const raw = await firstValueFrom(
        this.http.get<Record<string, { name: string }>>(`${this.url}/technologies.json`)
      );
      this.techCache = {};
      if (raw) {
        Object.entries(raw).forEach(([id, val]) => {
          if (val?.name) this.techCache![id] = val.name;
        });
      }
    } catch {
      this.techCache = {};
    }
    return this.techCache!;
  }

  // ── Obtiene proyectos y resuelve IDs de tecnologías a nombres ────────────
  async getProjects(projectType: string): Promise<Project[]> {
    const [raw, techMap] = await Promise.all([
      firstValueFrom(
        this.http.get<Record<string, Project>>(`${this.url}/${projectType}.json`)
      ),
      this.getTechMap(),
    ]);

    if (!raw) return [];

    this.projects = Object.entries(raw).map(([key, value]) => ({
      ...value,
      id: key,
      technologies: Array.isArray(value.technologies)
        ? value.technologies.map(t => techMap[t] ?? techMap[t.replace(/^-/, '')] ?? t)
        : [],
    }));

    return this.projects;
  }
}
